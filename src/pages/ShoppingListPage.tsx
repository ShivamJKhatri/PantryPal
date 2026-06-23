import { useState, useEffect, useMemo } from 'react'
import type { PantryStaple, RecipeShoppingList, RecipeShoppingListItem } from '../types/models.ts'
import { STORE_OPTIONS } from './SettingsPage.tsx'
import { matchIngredientLine } from '../services/api.ts'
import { showToast } from '../hooks/useToast.ts'
import PageShell from '../components/PageShell.tsx'
import Card from '../components/Card.tsx'
import EmptyState from '../components/EmptyState.tsx'
import IconButton from '../components/IconButton.tsx'
import Button from '../components/Button.tsx'
import CountUp from '../components/CountUp.tsx'
import { IconCheck, IconMinus, IconPlus, IconExternal, IconJar, IconReceipt } from '../components/icons.tsx'
import { useFlip } from '../hooks/useFlip.ts'

function storeDisplayName(storeId: string): string {
  return STORE_OPTIONS.find((s) => s.id === storeId)?.name ?? storeId
}

interface Props {
  list: RecipeShoppingList | null
  staples: PantryStaple[]
  onAddToPantry: (label: string) => void
  onNewRecipe: () => void
  onListChange?: (list: RecipeShoppingList) => void
}

function stapleLabels(staples: PantryStaple[]): Set<string> {
  return new Set(staples.map((s) => s.label.toLowerCase()))
}

function isStapleMatch(item: RecipeShoppingListItem, labels: Set<string>): boolean {
  const fields = [item.ingredientName, item.rawText, item.productName].map((s) => s.toLowerCase())
  for (const label of labels) {
    if (fields.some((f) => f.includes(label))) return true
  }
  return false
}

function applyPantryExclusions(
  items: RecipeShoppingListItem[],
  staples: PantryStaple[],
): RecipeShoppingListItem[] {
  const labels = stapleLabels(staples)
  return items.map((item) =>
    isStapleMatch(item, labels)
      ? { ...item, excluded: true, quantityToBuy: 0, lineTotal: 0 }
      : item,
  )
}

function calcTotal(items: RecipeShoppingListItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100
}

export default function ShoppingListPage({ list, staples, onAddToPantry, onNewRecipe, onListChange }: Props) {
  const [items, setItems] = useState<RecipeShoppingListItem[]>([])
  const [manual, setManual] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!list) {
      setItems([])
      return
    }
    setItems(applyPantryExclusions(list.items, staples))
  }, [list?.id])

  useEffect(() => {
    if (!list) return
    setItems((prev) => applyPantryExclusions(prev.length ? prev : list.items, staples))
  }, [staples])

  useEffect(() => {
    if (!list || !onListChange) return
    onListChange({
      ...list,
      items,
      estimatedTotal: calcTotal(items),
    })
  }, [items])

  const itemIds = useMemo(() => items.map((i) => i.id), [items])
  const flipRef = useFlip(itemIds)

  if (!list) {
    return (
      <PageShell>
        <EmptyState
          icon={<IconReceipt size={28} />}
          title="No shopping list yet"
          description="Paste a recipe URL or upload a screenshot to get started."
          action={{ label: 'Add a recipe', onClick: onNewRecipe }}
        />
      </PageShell>
    )
  }

  function toggleExclude(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const excluded = !item.excluded
        const qty = excluded ? 0 : Math.max(1, item.quantityToBuy || 1)
        return {
          ...item,
          excluded,
          quantityToBuy: qty,
          lineTotal: excluded ? 0 : Math.round(qty * item.price * 100) / 100,
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

  async function addManualItem(e: React.FormEvent) {
    e.preventDefault()
    const text = manual.trim()
    if (!text || adding) return
    setAdding(true)
    try {
      const item = await matchIngredientLine(text)
      const [withPantry] = applyPantryExclusions([item], staples)
      setItems((prev) => [...prev, withPantry])
      setManual('')
      showToast(
        withPantry.notFound ? 'Added without a store match' : `Added ${withPantry.ingredientName}`,
        withPantry.notFound ? 'default' : 'success',
      )
    } catch {
      showToast('Could not add item', 'error')
    } finally {
      setAdding(false)
    }
  }

  const active = items.filter((i) => !i.excluded && !i.notFound)
  const excluded = items.filter((i) => i.excluded)
  const notFound = items.filter((i) => i.notFound && !i.excluded)
  const total = calcTotal(items)
  const stapleSet = stapleLabels(staples)

  return (
    <PageShell title={list.recipeTitle}>
      <div className="list-meta">
        <span>{storeDisplayName(list.storeId)} · {list.zipCode}</span>
        <span className="list-meta__sep" aria-hidden>·</span>
        <span>{active.length} items</span>
        {list.sourceUrl && (
          <>
            <span className="list-meta__sep" aria-hidden>·</span>
            <a className="source-link" href={list.sourceUrl} target="_blank" rel="noreferrer">
              View recipe <IconExternal size={14} />
            </a>
          </>
        )}
      </div>

      <Card padding="sm" className="manual-add">
        <form className="add-form" onSubmit={(e) => void addManualItem(e)}>
          <input
            type="text"
            placeholder="Add an item manually…"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            disabled={adding}
          />
          <Button type="submit" size="md" disabled={!manual.trim()} loading={adding}>
            Add
          </Button>
        </form>
      </Card>

      {active.length > 0 && (
        <ul className="item-list stagger">
          {active.map((item, index) => (
            <li
              key={item.id}
              ref={flipRef(item.id)}
              className="item-row"
              style={{ '--i': index } as React.CSSProperties}
            >
              <button
                type="button"
                className="exclude-btn press"
                title="Remove from list"
                onClick={() => toggleExclude(item.id)}
              >
                <IconCheck size={14} />
              </button>
              <div className="item-info">
                <span className="item-name">{item.ingredientName}</span>
                <span className="item-detail">{item.rawText}</span>
                {item.aisle && <span className="item-aisle">{item.aisle}</span>}
              </div>
              <div className="item-actions">
                <div className="item-qty">
                  <IconButton
                    label="Decrease quantity"
                    onClick={() => changeQty(item.id, -1)}
                    disabled={item.quantityToBuy <= 1}
                  >
                    <IconMinus size={16} />
                  </IconButton>
                  <span>{item.quantityToBuy}</span>
                  <IconButton label="Increase quantity" onClick={() => changeQty(item.id, 1)}>
                    <IconPlus size={16} />
                  </IconButton>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="item-price">${item.lineTotal.toFixed(2)}</span>
                  <IconButton
                    label="Save to pantry"
                    onClick={() => {
                      onAddToPantry(item.ingredientName)
                      toggleExclude(item.id)
                    }}
                  >
                    <IconJar size={16} />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {active.length === 0 && excluded.length > 0 && (
        <EmptyState
          icon={<IconJar size={28} />}
          title="Everything is in your pantry"
          description="All items are excluded. Expand the section below to add any back."
        />
      )}

      {notFound.length > 0 && (
        <details className="section-details">
          <summary>Not found in catalog ({notFound.length})</summary>
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
        <details className="section-details" open={active.length === 0}>
          <summary>Excluded / in pantry ({excluded.length})</summary>
          <ul className="item-list muted stagger">
            {excluded.map((item, index) => (
              <li
                key={item.id}
                ref={flipRef(item.id)}
                className="item-row"
                style={{ '--i': index } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="exclude-btn excluded press"
                  title="Add back to list"
                  onClick={() => toggleExclude(item.id)}
                >
                  ○
                </button>
                <div className="item-info">
                  <span className="item-name">{item.ingredientName}</span>
                  {stapleSet.has(item.ingredientName.toLowerCase()) && (
                    <span className="item-pantry-tag">In pantry</span>
                  )}
                </div>
                <span className="item-price">—</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="list-total-bar">
        <div>
          <div className="list-total-bar__meta">{active.length} items · estimated</div>
          <div className="list-total-bar__amount">$<CountUp value={total} /></div>
          <div className="list-total-bar__disclaimer">Prices are estimates</div>
        </div>
        <Button variant="secondary" size="sm" onClick={onNewRecipe}>
          + Another recipe
        </Button>
      </div>
    </PageShell>
  )
}
