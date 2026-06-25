import { useState, useEffect } from 'react'
import CapturePage from './pages/CapturePage.tsx'
import ShoppingListPage from './pages/ShoppingListPage.tsx'
import PantryPage from './pages/PantryPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import BottomNav from './components/BottomNav.tsx'
import ToastStack from './components/Toast.tsx'
import { useUserPrefs } from './hooks/useUserPrefs.ts'
import { useRecipeCollection } from './hooks/useRecipeCollection.ts'
import { showToast } from './hooks/useToast.ts'
import type { PantryStaple } from './types/models.ts'
import {
  useAppHistory,
  pushAppState,
  type ListView,
  type Page,
} from './lib/app-history.ts'

const PANTRY_STORAGE_KEY = 'pantrypal_staples'

function loadStaples(): PantryStaple[] {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PantryStaple[]) : []
  } catch {
    return []
  }
}

export type { Page } from './lib/app-history.ts'

export default function App() {
  const { prefs, setPrefs, hasPrefs } = useUserPrefs()
  const {
    collection,
    addRecipe,
    updateRecipe,
    addRecipeToCart,
    removeRecipeFromCart,
    updateCartItems,
    hasRecipes,
    cartCount,
  } = useRecipeCollection()
  const [page, setPage] = useState<Page>(hasPrefs ? 'capture' : 'settings')
  const [listView, setListView] = useState<ListView>({ kind: 'recipes' })
  const [staples, setStaples] = useState<PantryStaple[]>(loadStaples)

  useAppHistory(page, listView, setPage, setListView)

  useEffect(() => {
    try {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(staples))
    } catch {
      // storage full or blocked
    }
  }, [staples])

  const TAB_ORDER: Page[] = ['capture', 'list', 'pantry', 'settings']

  function navigate(next: Page, opts?: { listView?: ListView }) {
    const nextListView = opts?.listView ?? (next === 'list' ? listView : undefined)
    if (opts?.listView) setListView(opts.listView)
    if (next !== 'list') setListView({ kind: 'recipes' })

    // Set direction for CSS slide transitions
    const fromIdx = TAB_ORDER.indexOf(page)
    const toIdx = TAB_ORDER.indexOf(next)
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
      document.documentElement.dataset.navDir = toIdx > fromIdx ? 'forward' : 'backward'
    } else {
      delete document.documentElement.dataset.navDir
    }

    const apply = () => {
      // Reset scroll on page change
      document.querySelector<HTMLElement>('.main')?.scrollTo({ top: 0, behavior: 'instant' })
      setPage(next)
      pushAppState(next, next === 'list' ? nextListView : undefined)
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const vt = (document as Document & {
        startViewTransition: (cb: () => void) => { finished: Promise<void> }
      }).startViewTransition(apply)
      vt.finished.finally(() => { delete document.documentElement.dataset.navDir })
    } else {
      apply()
    }
  }

  function navigateList(view: ListView) {
    setListView(view)
    if (page !== 'list') setPage('list')
    pushAppState('list', view)
  }

  function goBack() {
    history.back()
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
          onNavigate={(next) => {
            if (next === 'list') navigate('list', { listView: { kind: 'recipes' } })
            else navigate(next)
          }}
          hasList={hasRecipes}
          stapleCount={staples.length}
          storeName={prefs.storeName}
          zipCode={prefs.zipCode}
        />
      )}
      <main className={`main${isOnboarding ? ' main--onboarding' : ''}${page === 'capture' || page === 'list' ? ' main--wide' : ''}`} key={page}>
        {page === 'capture' && (
          <CapturePage
            prefs={prefs}
            onListReady={(list) => {
              addRecipe(list)
              navigate('list', { listView: { kind: 'recipes' } })
            }}
            onGoToSettings={() => navigate('settings')}
          />
        )}
        {page === 'list' && (
          <ShoppingListPage
            collection={collection}
            staples={staples}
            cartCount={cartCount}
            view={listView}
            onViewChange={navigateList}
            onBack={goBack}
            onAddToPantry={(label) => {
              if (addStaple(label)) showToast('Added to pantry', 'success')
            }}
            onRemoveFromPantry={removeStaple}
            onNewRecipe={() => navigate('capture')}
            onUpdateRecipe={updateRecipe}
            onUpdateCart={updateCartItems}
            onAddRecipeToCart={addRecipeToCart}
            onRemoveRecipeFromCart={removeRecipeFromCart}
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
