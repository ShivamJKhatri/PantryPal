import { useState, useEffect } from 'react'

export type UserPrefs = {
  storeId: string
  storeName: string
  zipCode: string
  cheapestMatch: boolean
  flagLowConfidence: boolean
}

const STORAGE_KEY = 'pantrypal_user_prefs'

const EMPTY_PREFS: UserPrefs = {
  storeId: '',
  storeName: '',
  zipCode: '',
  cheapestMatch: true,
  flagLowConfidence: true,
}

function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PREFS
    return { ...EMPTY_PREFS, ...(JSON.parse(raw) as Partial<UserPrefs>) }
  } catch {
    return EMPTY_PREFS
  }
}

export function useUserPrefs() {
  const [prefs, setPrefsState] = useState<UserPrefs>(loadPrefs)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // storage full or blocked — ignore
    }
  }, [prefs])

  function setPrefs(next: UserPrefs) {
    setPrefsState(next)
  }

  const hasPrefs = Boolean(prefs.storeId && prefs.zipCode)

  return { prefs, setPrefs, hasPrefs }
}
