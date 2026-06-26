export const RECIPE_EXTRACTION_SYSTEM_PROMPT = `You extract recipe data from screenshots of recipes (websites, apps, cookbooks, notes).

Return ONLY valid JSON with this exact shape (no markdown, no code fences):
{
  "title": "string",
  "ingredients": [
    { "rawText": "exact line as shown", "sortOrder": 0, "confidence": 0.0 }
  ],
  "steps": ["step 1 text", "step 2 text"]
}

Rules:
- ingredients: one entry per ingredient line, in display order (sortOrder starting at 0)
- rawText: keep quantities and units as written (e.g. "2 cups all-purpose flour")
- steps: numbered instructions only; omit if not visible
- confidence: 0-1 estimate for how clearly that line was read
- If no recipe is visible, use title "Unknown recipe", empty ingredients and steps`

export const RECIPE_EXTRACTION_USER_PROMPT =
  'Extract the recipe title, ingredient lines, and cooking steps from this screenshot.'

export const RECIPE_TEXT_EXTRACTION_SYSTEM_PROMPT = `You extract recipe data from webpage text.

Return ONLY valid JSON with this exact shape (no markdown, no code fences):
{
  "title": "string",
  "description": "one-sentence description or null",
  "servings": "e.g. '4 servings' or null",
  "prepTime": "e.g. '15 min' or null",
  "cookTime": "e.g. '30 min' or null",
  "ingredients": [
    { "rawText": "exact line as shown", "sortOrder": 0, "confidence": 0.0 }
  ],
  "steps": ["step 1 text", "step 2 text"]
}

Rules:
- ingredients: one entry per ingredient line, in display order (sortOrder starting at 0)
- rawText: keep quantities and units as written (e.g. "2 cups all-purpose flour")
- steps: full instruction sentences only, in order
- confidence: 0-1 estimate; use 0.9 if the text was clearly a recipe ingredient
- description/servings/prepTime/cookTime: set to null if not found
- If no recipe is found, use title "Unknown recipe", empty ingredients and steps`
