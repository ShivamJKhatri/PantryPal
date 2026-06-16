import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime'

import { getBedrockClient, getBedrockModelId } from '../bedrock-client.js'
import {
  RECIPE_EXTRACTION_SYSTEM_PROMPT,
  RECIPE_EXTRACTION_USER_PROMPT,
} from './prompt.js'
import type { ExtractedRecipe, VisionExtractionResult } from './types.js'

const SUPPORTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif'])

export function mediaTypeToImageFormat(mediaType: string): string {
  const normalized = mediaType.toLowerCase().replace('image/', '')
  if (normalized === 'jpg') {
    return 'jpeg'
  }
  if (SUPPORTED_FORMATS.has(normalized)) {
    return normalized
  }
  throw new Error(`Unsupported image type: ${mediaType}. Use jpeg, png, webp, or gif.`)
}

function parseModelJson(text: string): ExtractedRecipe {
  const trimmed = text.trim()
  const jsonText =
    trimmed.startsWith('```') ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '') : trimmed

  const parsed = JSON.parse(jsonText) as Partial<ExtractedRecipe>

  if (!parsed.title || !Array.isArray(parsed.ingredients)) {
    throw new Error('Model response missing title or ingredients')
  }

  return {
    title: parsed.title,
    ingredients: parsed.ingredients.map((item, index) => ({
      rawText: item.rawText ?? '',
      sortOrder: item.sortOrder ?? index,
      confidence: item.confidence,
    })),
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
  }
}

export async function extractRecipeFromImage(
  imageBytes: Uint8Array,
  mediaType: string,
): Promise<VisionExtractionResult> {
  const format = mediaTypeToImageFormat(mediaType)
  const modelId = getBedrockModelId()
  const client = getBedrockClient()

  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [{ text: RECIPE_EXTRACTION_SYSTEM_PROMPT }],
      messages: [
        {
          role: 'user',
          content: [
            {
              image: {
                format: format as 'jpeg' | 'png' | 'webp' | 'gif',
                source: { bytes: imageBytes },
              },
            },
            { text: RECIPE_EXTRACTION_USER_PROMPT },
          ],
        },
      ],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.2,
        topP: 0.9,
      },
      additionalModelRequestFields: {
        inferenceConfig: { topK: 20 },
      },
    }),
  )

  const textBlock = response.output?.message?.content?.find((block) => 'text' in block && block.text)
  const text = textBlock && 'text' in textBlock ? textBlock.text : undefined

  if (!text) {
    throw new Error('Bedrock returned no text content')
  }

  return {
    recipe: parseModelJson(text),
    modelId,
    usage: {
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens,
    },
  }
}
