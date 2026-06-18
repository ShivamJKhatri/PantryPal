import { useState } from 'react'
import CapturePage from './pages/CapturePage.tsx'
import ShoppingListPage from './pages/ShoppingListPage.tsx'
import PantryPage from './pages/PantryPage.tsx'
import type { PantryStaple, RecipeShoppingList } from './types/models.ts'
import { mockPantryStaples } from './data/mock-data.ts'

export type Page = 'capture' | 'list' | 'pantry'

export default function App() {
  const [page, setPage] = useState<Page>('capture')
  const [shoppingList, setShoppingList] = useState<RecipeShoppingList | null>(null)
  const [staples, setStaples] = useState<PantryStaple[]>(mockPantryStaples)

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
        </div>
      </nav>

      <main className="main">
        {page === 'capture' && (
          <CapturePage
            onListReady={(list) => {
              setShoppingList(list)
              setPage('list')
            }}
          />
        )}
        {page === 'list' && (
          <ShoppingListPage list={shoppingList} staples={staples} />
        )}
        {page === 'pantry' && (
          <PantryPage staples={staples} onAdd={addStaple} onRemove={removeStaple} />
        )}
      </main>
    </div>
  )
}
