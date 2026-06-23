import { useState, useEffect, useCallback } from 'react'
import type { RecipeCollection, RecipeShoppingList, RecipeShoppingListItem } from '../types/models.ts'
import { mergeItems, calcTotal } from '../lib/merge-items.ts'
import { normalizeItems } from '../lib/normalize-item.ts'

const COLLECTION_KEY = 'pantrypal_recipes'
const LEGACY_LIST_KEY = 'pantrypal_list'

const EMPTY: RecipeCollection = { recipes: [], cartItems: [], cartRecipeIds: [] }

function normalizeCollection(collection: RecipeCollection): RecipeCollection {
  return {
    ...collection,
    recipes: collection.recipes.map((r) => ({
      ...r,
      items: normalizeItems(r.items),
      estimatedTotal: calcTotal(normalizeItems(r.items)),
    })),
    cartItems: normalizeItems(collection.cartItems),
  }
}

function loadCollection(): RecipeCollection {
  try {
    const raw = sessionStorage.getItem(COLLECTION_KEY)
    if (raw) return normalizeCollection(JSON.parse(raw) as RecipeCollection)
    const legacy = sessionStorage.getItem(LEGACY_LIST_KEY)
    if (legacy) {
      const list = JSON.parse(legacy) as RecipeShoppingList
      return normalizeCollection({ recipes: [{ ...list, items: normalizeItems(list.items) }], cartItems: [], cartRecipeIds: [] })
    }
  } catch {
    // corrupt storage
  }
  return EMPTY
}

function rebuildCart(recipes: RecipeShoppingList[], cartRecipeIds: string[]): RecipeShoppingListItem[] {
  let items: RecipeShoppingListItem[] = []
  for (const id of cartRecipeIds) {
    const recipe = recipes.find((r) => r.id === id)
    if (recipe) items = mergeItems(items, normalizeItems(recipe.items))
  }
  return items
}

export function useRecipeCollection() {
  const [collection, setCollection] = useState<RecipeCollection>(loadCollection)

  useEffect(() => {
    try {
      if (collection.recipes.length || collection.cartItems.length) {
        sessionStorage.setItem(COLLECTION_KEY, JSON.stringify(collection))
      } else {
        sessionStorage.removeItem(COLLECTION_KEY)
      }
      sessionStorage.removeItem(LEGACY_LIST_KEY)
    } catch {
      // storage blocked
    }
  }, [collection])

  const addRecipe = useCallback((list: RecipeShoppingList) => {
    const items = normalizeItems(list.items)
    setCollection((prev) => ({
      ...prev,
      recipes: [
        ...prev.recipes,
        {
          ...list,
          id: list.id || crypto.randomUUID(),
          items,
          estimatedTotal: calcTotal(items),
        },
      ],
    }))
  }, [])

  const updateRecipe = useCallback((recipeId: string, items: RecipeShoppingListItem[]) => {
    setCollection((prev) => {
      const recipes = prev.recipes.map((r) =>
        r.id === recipeId
          ? { ...r, items, estimatedTotal: calcTotal(items) }
          : r,
      )
      const cartItems = prev.cartRecipeIds.includes(recipeId)
        ? rebuildCart(recipes, prev.cartRecipeIds)
        : prev.cartItems
      return { ...prev, recipes, cartItems }
    })
  }, [])

  const addRecipeToCart = useCallback((recipeId: string) => {
    setCollection((prev) => {
      if (prev.cartRecipeIds.includes(recipeId)) return prev
      const cartRecipeIds = [...prev.cartRecipeIds, recipeId]
      return {
        ...prev,
        cartRecipeIds,
        cartItems: rebuildCart(prev.recipes, cartRecipeIds),
      }
    })
  }, [])

  const removeRecipeFromCart = useCallback((recipeId: string) => {
    setCollection((prev) => {
      const cartRecipeIds = prev.cartRecipeIds.filter((id) => id !== recipeId)
      return {
        ...prev,
        cartRecipeIds,
        cartItems: rebuildCart(prev.recipes, cartRecipeIds),
      }
    })
  }, [])

  const updateCartItems = useCallback((items: RecipeShoppingListItem[]) => {
    setCollection((prev) => ({ ...prev, cartItems: items }))
  }, [])

  const removeRecipe = useCallback((recipeId: string) => {
    setCollection((prev) => {
      const recipes = prev.recipes.filter((r) => r.id !== recipeId)
      const cartRecipeIds = prev.cartRecipeIds.filter((id) => id !== recipeId)
      return {
        recipes,
        cartRecipeIds,
        cartItems: rebuildCart(recipes, cartRecipeIds),
      }
    })
  }, [])

  return {
    collection,
    addRecipe,
    updateRecipe,
    addRecipeToCart,
    removeRecipeFromCart,
    updateCartItems,
    removeRecipe,
    hasRecipes: collection.recipes.length > 0,
    cartCount: collection.cartItems.filter((i) => !i.excluded && !i.notFound).length,
  }
}
