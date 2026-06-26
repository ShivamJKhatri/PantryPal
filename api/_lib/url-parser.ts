import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { getBedrockClient, getBedrockModelId } from './bedrock-client.js'
import { RECIPE_TEXT_EXTRACTION_SYSTEM_PROMPT } from './vision/prompt.js'
import type { ExtractedRecipe } from './vision/types.js'

// ── JSON-LD schema.org/Recipe parser ────────────────────────────────────────

type SchemaRecipe = {
  '@type': string | string[]
  name?: string
  description?: string
  recipeYield?: string | string[] | number
  prepTime?: string
  cookTime?: string
  totalTime?: string
  recipeIngredient?: string[]
  recipeInstructions?: SchemaInstruction[] | string[]
  '@graph'?: SchemaRecipe[]
}

function parseDuration(iso?: string): string | undefined {
  if (!iso) return undefined
  const m = iso.match(/PT?(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return undefined
  const h = parseInt(m[1] ?? '0')
  const min = parseInt(m[2] ?? '0')
  if (h === 0 && min === 0) return undefined
  if (h === 0) return `${min} min`
  if (min === 0) return `${h} hr`
  return `${h} hr ${min} min`
}

type SchemaInstruction =
  | string
  | { '@type': string; text?: string; name?: string; itemListElement?: SchemaInstruction[] }

function parseSchemaRecipe(data: SchemaRecipe): ExtractedRecipe | null {
  const ingredients = Array.isArray(data.recipeIngredient) ? data.recipeIngredient : []
  if (ingredients.length === 0) return null

  const steps: string[] = []
  if (Array.isArray(data.recipeInstructions)) {
    for (const inst of data.recipeInstructions) {
      if (typeof inst === 'string') {
        steps.push(inst)
      } else if (inst['@type'] === 'HowToStep') {
        if (inst.text) steps.push(inst.text)
      } else if (inst['@type'] === 'HowToSection' && Array.isArray(inst.itemListElement)) {
        for (const step of inst.itemListElement) {
          if (typeof step === 'string') steps.push(step)
          else if (typeof step === 'object' && step !== null && 'text' in step && step.text) {
            steps.push(step.text as string)
          }
        }
      }
    }
  }

  const rawYield = data.recipeYield
  const servings = rawYield
    ? (Array.isArray(rawYield) ? rawYield[0] : rawYield).toString()
    : undefined

  return {
    title: data.name ?? 'Unknown Recipe',
    description: data.description?.trim() || undefined,
    servings,
    prepTime: parseDuration(data.prepTime),
    cookTime: parseDuration(data.cookTime ?? data.totalTime),
    ingredients: ingredients.map((rawText, i) => ({
      rawText,
      sortOrder: i,
      confidence: 1.0,
    })),
    steps: steps.filter(Boolean),
  }
}

function extractJsonLd(html: string): ExtractedRecipe | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      const raw: unknown = JSON.parse(m[1])
      const nodes: SchemaRecipe[] = Array.isArray(raw) ? (raw as SchemaRecipe[]) : [raw as SchemaRecipe]
      for (const node of nodes) {
        // Handle @graph wrapper
        const candidates: SchemaRecipe[] = Array.isArray(node['@graph'])
          ? [...(node['@graph'] as SchemaRecipe[]), node]
          : [node]
        for (const candidate of candidates) {
          const t = candidate['@type']
          const isRecipe = t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))
          if (isRecipe) {
            const result = parseSchemaRecipe(candidate)
            if (result) return result
          }
        }
      }
    } catch {
      // malformed JSON-LD — keep searching
    }
  }
  return null
}

// ── Bedrock text fallback ────────────────────────────────────────────────────

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 14000)
}

function parseModelJson(text: string): ExtractedRecipe {
  const trimmed = text.trim()
  const jsonText = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    : trimmed

  const parsed = JSON.parse(jsonText) as Partial<ExtractedRecipe> & { description?: string | null; servings?: string | null; prepTime?: string | null; cookTime?: string | null }
  if (!parsed.title || !Array.isArray(parsed.ingredients)) {
    throw new Error('Model response missing title or ingredients')
  }
  return {
    title: parsed.title,
    description: parsed.description ?? undefined,
    servings: parsed.servings ?? undefined,
    prepTime: parsed.prepTime ?? undefined,
    cookTime: parsed.cookTime ?? undefined,
    ingredients: parsed.ingredients.map((item, i) => ({
      rawText: item.rawText ?? '',
      sortOrder: item.sortOrder ?? i,
      confidence: item.confidence,
    })),
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
  }
}

async function extractFromText(pageText: string): Promise<ExtractedRecipe> {
  const client = getBedrockClient()
  const modelId = getBedrockModelId()

  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [{ text: RECIPE_TEXT_EXTRACTION_SYSTEM_PROMPT }],
      messages: [
        {
          role: 'user',
          content: [{ text: `Extract the recipe from this webpage text:\n\n${pageText}` }],
        },
      ],
      inferenceConfig: { maxTokens: 2000, temperature: 0.2 },
    }),
  )

  const textBlock = response.output?.message?.content?.find((b: { text?: string }) => 'text' in b && b.text)
  const text = textBlock && 'text' in textBlock ? textBlock.text : undefined
  if (!text) throw new Error('Bedrock returned no text content')
  return parseModelJson(text)
}

// ── Public entry point ───────────────────────────────────────────────────────

export async function parseRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  // Validate URL
  new URL(url) // throws on invalid

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PantryPal-RecipeBot/1.0' },
    })
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  // Try JSON-LD first — fast, accurate, no LLM cost
  const fromSchema = extractJsonLd(html)
  if (fromSchema) return fromSchema

  // Fall back to Bedrock text extraction
  const pageText = extractTextFromHtml(html)
  return extractFromText(pageText)
}
