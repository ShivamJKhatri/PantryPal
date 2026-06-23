import { useState, useEffect } from 'react'
import CapturePage from './pages/CapturePage.tsx'
import ShoppingListPage from './pages/ShoppingListPage.tsx'
import PantryPage from './pages/PantryPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import BottomNav from './components/BottomNav.tsx'
import ToastStack from './components/Toast.tsx'
import { useUserPrefs } from './hooks/useUserPrefs.ts'
import { useShoppingList } from './hooks/useShoppingList.ts'
import { mergeShoppingLists } from './lib/merge-shopping-list.ts'
import { showToast } from './hooks/useToast.ts'
import type { PantryStaple } from './types/models.ts'

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
  const { list: shoppingList, setList: setShoppingList } = useShoppingList()
  const [page, setPage] = useState<Page>(hasPrefs ? 'capture' : 'settings')
  const [staples, setStaples] = useState<PantryStaple[]>(loadStaples)

  useEffect(() => {
    try {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(staples))
    } catch {
      // storage full or blocked
    }
  }, [staples])

  function navigate(next: Page) {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      ;(document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() =>
        setPage(next),
      )
    } else {
      setPage(next)
    }
  }

  function addStaple(label: string): boolean {
    const trimmed = label.trim()
    if (!trimmed) return false
    const exists = staples.some((s) => s.label.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      showToast('Already in your pantry', 'error')
      return false
    }
    setStaples((prev) => [
      ...prev,
      {
        id: `ps-${Date.now()}`,
        userId: 'user-1',
        canonicalIngredientId: trimmed.toLowerCase().replace(/\s+/g, '-'),
        label: trimmed,
      },
    ])
    return true
  }

  function removeStaple(id: string) {
    setStaples((prev) => prev.filter((s) => s.id !== id))
  }

  const isOnboarding = !hasPrefs && page === 'settings'

  return (
    <div className="app">
      {!isOnboarding && (
        <BottomNav
          page={page}
          onNavigate={navigate}
          hasList={!!shoppingList}
          stapleCount={staples.length}
        />
      )}
      <main className={`main${isOnboarding ? ' main--onboarding' : ''}`} key={page}>
        {page === 'capture' && (
          <CapturePage
            prefs={prefs}
            onListReady={(list) => {
              setShoppingList((prev) => (prev ? mergeShoppingLists(prev, list) : list))
              navigate('list')
            }}
            onGoToSettings={() => navigate('settings')}
          />
        )}
        {page === 'list' && (
          <ShoppingListPage
            list={shoppingList}
            staples={staples}
            onAddToPantry={(label) => {
              if (addStaple(label)) showToast('Added to pantry', 'success')
            }}
            onNewRecipe={() => navigate('capture')}
            onListChange={setShoppingList}
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
              showToast(isOnboarding ? 'You\'re all set!' : 'Settings saved', 'success')
              navigate('capture')
            }}
          />
        )}
      </main>
      <ToastStack />
    </div>
  )
}
