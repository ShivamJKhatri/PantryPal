import { useState, useEffect } from 'react'
import type { PantryStaple, RecipeShoppingList, RecipeShoppingListItem } from '../types/models.ts'

interface Props {
  list: RecipeShoppingList | null
  staples: PantryStaple[]
}

function applyPantryExclusions(
  items: RecipeShoppingListItem[],
  staples: PantryStaple[],
): RecipeShoppingListItem[] {
  const stapleNames = new Set(staples.map((s) => s.label.toLowerCase()))
  return items.map((item) =>
    stapleNames.has(item.ingredientName.toLowerCase()) ? { ...item, excluded: true, quantityToBuy: 0, lineTotal: 0 } : item,
  )
}

function calcTotal(items: RecipeShoppingListItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100
}

export default function ShoppingListPage({ list, staples }: Props) {
  const [items, setItems] = useState<RecipeShoppingListItem[]>([])

  useEffect(() => {
    if (list) setItems(applyPantryExclusions(list.items, staples))
  }, [list, staples])

  if (!list) {
    return (
      <div className="empty-state">
        <p>No shopping list yet. Add a recipe to get started.</p>
      </div>
    )
  }

  function toggleExclude(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const excluded = !item.excluded
        return {
          ...item,
          excluded,
          quantityToBuy: excluded ? 0 : 1,
          lineTotal: excluded ? 0 : item.price,
        }
      }),
    )
  }

  function changeQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const qty = Math.max(0, item.quantityToBuy + delta)
        return {
          ...item,
          quantityToBuy: qty,
          lineTotal: Math.round(qty * item.price * 100) / 100,
          excluded: qty === 0,
        }
      }),
    )
  }

  const active = items.filter((i) => !i.excluded && !i.notFound)
  const excluded = items.filter((i) => i.excluded)
  const notFound = items.filter((i) => i.notFound)
  const total = calcTotal(items)

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>{list.recipeTitle}</h1>
        {list.sourceUrl && (
          <a className="source-link" href={list.sourceUrl} target="_blank" rel="noreferrer">
            View recipe ↗
          </a>
        )}
      </div>
      <p className="subtitle">Kroger · {list.zipCode}</p>

      {active.length > 0 && (
        <ul className="item-list">
          {active.map((item) => (
            <li key={item.id} className="item-row">
              <button
                className="exclude-btn"
                title="Remove from list"
                onClick={() => toggleExclude(item.id)}
              >
                ✓
              </button>
              <div className="item-info">
                <span className="item-name">{item.ingredientName}</span>
                <span className="item-detail">{item.rawText}</span>
                {item.aisle && <span className="item-aisle">{item.aisle}</span>}
              </div>
              <div className="item-qty">
                <button onClick={() => changeQty(item.id, -1)} disabled={item.quantityToBuy <= 1}>−</button>
                <span>{item.quantityToBuy}</span>
                <button onClick={() => changeQty(item.id, 1)}>+</button>
              </div>
              <span className="item-price">${item.lineTotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      {notFound.length > 0 && (
        <details className="section-details">
          <summary>Not found in store ({notFound.length})</summary>
          <ul className="item-list muted">
            {notFound.map((item) => (
              <li key={item.id} className="item-row">
                <span className="item-name">{item.rawText}</span>
                <span className="item-price">—</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {excluded.length > 0 && (
        <details className="section-details">
          <summary>Excluded / in pantry ({excluded.length})</summary>
          <ul className="item-list muted">
            {excluded.map((item) => (
              <li key={item.id} className="item-row">
                <button
                  className="exclude-btn excluded"
                  title="Add back to list"
                  onClick={() => toggleExclude(item.id)}
                >
                  ○
                </button>
                <span className="item-name">{item.ingredientName}</span>
                <span className="item-price">—</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="list-total">
        <span>Estimated total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
    </div>
  )
}
