import type {
  NormalizedIngredient,
  PantryStaple,
  Recipe,
  RecipeIngredient,
  ShoppingList,
  ShoppingListItem,
  Store,
  StoreProduct,
  User,
} from '../types/models.ts'

const MOCK_TIMESTAMP = '2026-06-08T14:30:00.000Z'

export const mockUser: User = {
  id: 'user-1',
  preferredStoreId: 'store-kroger',
  zipCode: '43210',
}

export const mockStore: Store = {
  id: 'store-kroger',
  name: 'Kroger',
  supportsLivePricing: true,
}

export const mockRecipe: Recipe = {
  id: 'rec-1',
  userId: mockUser.id,
  title: 'Creamy Garlic Pasta',
  sourceType: 'url',
  sourceUrl: 'https://example.com/creamy-garlic-pasta',
  createdAt: MOCK_TIMESTAMP,
  steps: [
    'Bring a large pot of salted water to a boil and cook spaghetti until al dente.',
    'Sauté minced garlic in olive oil until fragrant, about 1 minute.',
    'Stir in heavy cream and parmesan; simmer until slightly thickened.',
    'Toss pasta with sauce, season with salt and pepper, and serve.',
  ],
}

export const mockRecipeIngredients: RecipeIngredient[] = [
  { id: 'ri-1', recipeId: mockRecipe.id, rawText: '1 lb spaghetti', sortOrder: 0, confidence: 0.98 },
  { id: 'ri-2', recipeId: mockRecipe.id, rawText: '2 tbsp olive oil', sortOrder: 1, confidence: 0.95 },
  { id: 'ri-3', recipeId: mockRecipe.id, rawText: '4 cloves garlic, minced', sortOrder: 2, confidence: 0.92 },
  { id: 'ri-4', recipeId: mockRecipe.id, rawText: '1 cup heavy cream', sortOrder: 3, confidence: 0.97 },
  { id: 'ri-5', recipeId: mockRecipe.id, rawText: '1/2 cup grated parmesan', sortOrder: 4, confidence: 0.94 },
  { id: 'ri-6', recipeId: mockRecipe.id, rawText: 'Salt and pepper to taste', sortOrder: 5, confidence: 0.88 },
]

export const mockNormalizedIngredients: NormalizedIngredient[] = [
  {
    id: 'ni-1',
    recipeIngredientId: 'ri-1',
    canonicalId: 'spaghetti',
    name: 'Spaghetti',
    quantity: 1,
    unit: 'lb',
    packageQuantity: 1,
    packageUnit: 'lb box',
  },
  {
    id: 'ni-2',
    recipeIngredientId: 'ri-2',
    canonicalId: 'olive-oil',
    name: 'Olive oil',
    quantity: 2,
    unit: 'tbsp',
    packageQuantity: 1,
    packageUnit: '16 oz bottle',
    hasLeftovers: true,
  },
  {
    id: 'ni-3',
    recipeIngredientId: 'ri-3',
    canonicalId: 'garlic',
    name: 'Garlic',
    quantity: 4,
    unit: 'cloves',
    packageQuantity: 1,
    packageUnit: 'bulb',
    hasLeftovers: true,
  },
  {
    id: 'ni-4',
    recipeIngredientId: 'ri-4',
    canonicalId: 'heavy-cream',
    name: 'Heavy cream',
    quantity: 1,
    unit: 'cup',
    packageQuantity: 1,
    packageUnit: 'pint',
    hasLeftovers: true,
  },
  {
    id: 'ni-5',
    recipeIngredientId: 'ri-5',
    canonicalId: 'parmesan-cheese',
    name: 'Parmesan cheese',
    quantity: 0.5,
    unit: 'cup',
    packageQuantity: 1,
    packageUnit: '8 oz wedge',
    hasLeftovers: true,
  },
  {
    id: 'ni-6',
    recipeIngredientId: 'ri-6',
    canonicalId: 'salt-pepper',
    name: 'Salt and pepper',
    quantity: 1,
    unit: 'to taste',
  },
]

export const mockStoreProducts: StoreProduct[] = [
  {
    id: 'sku-spaghetti',
    storeId: mockStore.id,
    name: 'Kroger Spaghetti',
    brand: 'Kroger',
    price: 1.29,
    unit: 'each',
    aisle: 'Pasta',
    inStock: true,
    lastPriceUpdated: MOCK_TIMESTAMP,
  },
  {
    id: 'sku-olive-oil',
    storeId: mockStore.id,
    name: 'Extra Virgin Olive Oil',
    brand: 'Private Selection',
    price: 7.49,
    unit: 'each',
    aisle: 'Oils',
    inStock: true,
    lastPriceUpdated: MOCK_TIMESTAMP,
  },
  {
    id: 'sku-garlic',
    storeId: mockStore.id,
    name: 'Fresh Garlic',
    brand: 'Produce',
    price: 0.69,
    unit: 'each',
    aisle: 'Produce',
    inStock: true,
    lastPriceUpdated: MOCK_TIMESTAMP,
  },
  {
    id: 'sku-heavy-cream',
    storeId: mockStore.id,
    name: 'Heavy Whipping Cream',
    brand: 'Kroger',
    price: 3.99,
    unit: 'each',
    aisle: 'Dairy',
    inStock: true,
    lastPriceUpdated: MOCK_TIMESTAMP,
  },
  {
    id: 'sku-parmesan',
    storeId: mockStore.id,
    name: 'Parmesan Cheese Wedge',
    brand: 'BelGioioso',
    price: 5.49,
    unit: 'each',
    aisle: 'Cheese',
    inStock: true,
    lastPriceUpdated: MOCK_TIMESTAMP,
  },
]

export const mockPantryStaples: PantryStaple[] = [
  {
    id: 'ps-1',
    userId: mockUser.id,
    canonicalIngredientId: 'olive-oil',
    label: 'Olive oil',
  },
  {
    id: 'ps-2',
    userId: mockUser.id,
    canonicalIngredientId: 'salt-pepper',
    label: 'Salt and pepper',
  },
]

const mockShoppingListItems: ShoppingListItem[] = [
  {
    id: 'sli-1',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-1',
    storeProductId: 'sku-spaghetti',
    quantityToBuy: 1,
    lineTotal: 1.29,
    excluded: false,
    userEdited: false,
  },
  {
    id: 'sli-2',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-2',
    storeProductId: 'sku-olive-oil',
    quantityToBuy: 0,
    lineTotal: 0,
    excluded: true,
    userEdited: false,
  },
  {
    id: 'sli-3',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-3',
    storeProductId: 'sku-garlic',
    quantityToBuy: 1,
    lineTotal: 0.69,
    excluded: false,
    userEdited: false,
  },
  {
    id: 'sli-4',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-4',
    storeProductId: 'sku-heavy-cream',
    quantityToBuy: 1,
    lineTotal: 3.99,
    excluded: false,
    userEdited: false,
  },
  {
    id: 'sli-5',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-5',
    storeProductId: 'sku-parmesan',
    quantityToBuy: 1,
    lineTotal: 5.49,
    excluded: false,
    userEdited: false,
  },
  {
    id: 'sli-6',
    shoppingListId: 'list-1',
    normalizedIngredientId: 'ni-6',
    storeProductId: 'sku-olive-oil',
    quantityToBuy: 0,
    lineTotal: 0,
    excluded: true,
    userEdited: false,
  },
]

export const mockShoppingList: ShoppingList = {
  id: 'list-1',
  recipeId: mockRecipe.id,
  userId: mockUser.id,
  storeId: mockStore.id,
  zipCode: mockUser.zipCode,
  items: mockShoppingListItems,
  estimatedTotal: 11.46,
  currency: 'USD',
  createdAt: MOCK_TIMESTAMP,
  priceFreshness: MOCK_TIMESTAMP,
}

/** Lookup helpers for UI development */
export function getStoreProductById(id: string): StoreProduct | undefined {
  return mockStoreProducts.find((product) => product.id === id)
}

export function getNormalizedIngredientById(id: string): NormalizedIngredient | undefined {
  return mockNormalizedIngredients.find((ingredient) => ingredient.id === id)
}

export function getRecipeIngredientById(id: string): RecipeIngredient | undefined {
  return mockRecipeIngredients.find((ingredient) => ingredient.id === id)
}
