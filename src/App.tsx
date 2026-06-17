import { useState } from 'react'
import CapturePage from './pages/CapturePage.tsx'
import ShoppingListPage from './pages/ShoppingListPage.tsx'
import PantryPage from './pages/PantryPage.tsx'
import type { ShoppingList } from './types/models.ts'

export type Page = 'capture' | 'list' | 'pantry'

export default function App() {
  const [page, setPage] = useState<Page>('capture')
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)

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
        {page === 'list' && <ShoppingListPage list={shoppingList} />}
        {page === 'pantry' && <PantryPage />}
      </main>
    </div>
  )
}
