import { useState, useEffect } from 'react'
import type { RecipeShoppingList } from '../types/models.ts'

const LIST_KEY = 'lettuceeat_list'
const LEGACY_LIST_KEYS = ['waddamaq_list', 'pantrypal_list']

function loadList(): RecipeShoppingList | null {
  try {
    const raw =
      sessionStorage.getItem(LIST_KEY) ??
      LEGACY_LIST_KEYS.map((k) => sessionStorage.getItem(k)).find(Boolean)
    return raw ? (JSON.parse(raw) as RecipeShoppingList) : null
  } catch {
    return null
  }
}

export function useShoppingList() {
  const [list, setList] = useState<RecipeShoppingList | null>(loadList)

  useEffect(() => {
    try {
      if (list) sessionStorage.setItem(LIST_KEY, JSON.stringify(list))
      else sessionStorage.removeItem(LIST_KEY)
    } catch {
      // storage blocked
    }
  }, [list])

  return { list, setList }
}
