export type ExtractedIngredient = {
  rawText: string
  sortOrder: number
  confidence?: number
}

export type ExtractedRecipe = {
  title: string
  ingredients: ExtractedIngredient[]
  steps: string[]
}

export type VisionExtractionResult = {
  recipe: ExtractedRecipe
  modelId: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}
