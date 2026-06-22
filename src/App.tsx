import { useState, useEffect } from 'react'
import CapturePage from './pages/CapturePage.tsx'
import ShoppingListPage from './pages/ShoppingListPage.tsx'
import PantryPage from './pages/PantryPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import { useUserPrefs } from './hooks/useUserPrefs.ts'
import type { PantryStaple, RecipeShoppingList } from './types/models.ts'

const PANTRY_STORAGE_KEY = 'pantrypal_staples'

function loadStaples(): PantryStaple[] {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PantryStaple[]) : []
  } catch {
    return []
  }
}

export type Page = 'capture' | 'list' | 'pantry' | 'settings'

export default function App() {
  const { prefs, setPrefs, hasPrefs } = useUserPrefs()
  const [page, setPage] = useState<Page>(hasPrefs ? 'capture' : 'settings')
  const [shoppingList, setShoppingList] = useState<RecipeShoppingList | null>(null)
  const [staples, setStaples] = useState<PantryStaple[]>(loadStaples)

  useEffect(() => {
    try {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(staples))
    } catch {
      // storage full or blocked — ignore
    }
  }, [staples])

  function addStaple(label: string) {
    const staple: PantryStaple = {
      id: `ps-${Date.now()}`,
      userId: 'user-1',
      canonicalIngredientId: label.toLowerCase().replace(/\s+/g, '-'),
      label,
    }
    setStaples((prev) => [...prev, staple])
  }

  function removeStaple(id: string) {
    setStaples((prev) => prev.filter((s) => s.id !== id))
  }

  const isOnboarding = !hasPrefs && page === 'settings'

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-brand">PantryPal</span>
        <div className="nav-links">
          <button
            className={page === 'capture' ? 'active' : ''}
            onClick={() => setPage('capture')}
          >
            Add Recipe
          </button>
          <button
            className={page === 'list' ? 'active' : ''}
            onClick={() => setPage('list')}
            disabled={!shoppingList}
          >
            Shopping List
          </button>
          <button
            className={page === 'pantry' ? 'active' : ''}
            onClick={() => setPage('pantry')}
          >
            My Pantry
          </button>
          <button
            className={page === 'settings' ? 'active' : ''}
            onClick={() => setPage('settings')}
          >
            Settings
          </button>
        </div>
      </nav>

      <main className="main">
        {page === 'capture' && (
          <CapturePage
            prefs={prefs}
            onListReady={(list) => {
              setShoppingList(list)
              setPage('list')
            }}
            onGoToSettings={() => setPage('settings')}
          />
        )}
        {page === 'list' && (
          <ShoppingListPage
            list={shoppingList}
            staples={staples}
            onAddToPantry={addStaple}
            onNewRecipe={() => setPage('capture')}
          />
        )}
        {page === 'pantry' && (
          <PantryPage staples={staples} onAdd={addStaple} onRemove={removeStaple} />
        )}
        {page === 'settings' && (
          <SettingsPage
            prefs={prefs}
            isOnboarding={isOnboarding}
            onSave={(next) => {
              setPrefs(next)
              setPage('capture')
            }}
          />
        )}
      </main>
    </div>
  )
}
