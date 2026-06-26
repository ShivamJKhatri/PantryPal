export type ExtractedIngredient = {
  rawText: string
  sortOrder: number
  confidence?: number
}

export type ExtractedRecipe = {
  title: string
  ingredients: ExtractedIngredient[]
  steps: string[]
  description?: string
  servings?: string
  prepTime?: string
  cookTime?: string
}

export type VisionExtractionResult = {
  recipe: ExtractedRecipe
  modelId: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}
