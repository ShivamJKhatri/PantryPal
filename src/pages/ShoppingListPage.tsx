import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import type { PantryStaple, RecipeCollection, RecipeShoppingList, RecipeShoppingListItem } from '../types/models.ts'
import { STORE_OPTIONS } from './SettingsPage.tsx'
import { matchIngredientLine } from '../services/api.ts'
import { showToast } from '../hooks/useToast.ts'
import { getItemDisplay } from '../lib/display-item.ts'
import { calcTotal } from '../lib/merge-items.ts'
import PageShell from '../components/PageShell.tsx'
import Card from '../components/Card.tsx'
import EmptyState from '../components/EmptyState.tsx'
import IconButton from '../components/IconButton.tsx'
import Button from '../components/Button.tsx'
import CountUp from '../components/CountUp.tsx'
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconExternal,
  IconJar,
  IconReceipt,
  IconCart,
  IconChevronLeft,
} from '../components/icons.tsx'
import { useFlip } from '../hooks/useFlip.ts'

type View = { kind: 'recipes' } | { kind: 'detail'; recipeId: string } | { kind: 'cart' }

function storeDisplayName(storeId: string): string {
  return STORE_OPTIONS.find((s) => s.id === storeId)?.name ?? storeId
}

interface Props {
  collection: RecipeCollection
  staples: PantryStaple[]
  onAddToPantry: (label: string) => void
  onNewRecipe: () => void
  onUpdateRecipe: (recipeId: string, items: RecipeShoppingListItem[]) => void
  onUpdateCart: (items: RecipeShoppingListItem[]) => void
  onAddRecipeToCart: (recipeId: string) => void
  onRemoveRecipeFromCart: (recipeId: string) => void
  cartCount: number
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

function activeCount(items: RecipeShoppingListItem[]): number {
  return items.filter((i) => !i.excluded && !i.notFound).length
}

function ItemRow({
  item,
  index,
  flipRef,
  onToggleExclude,
  onChangeQty,
  onAddToPantry,
}: {
  item: RecipeShoppingListItem
  index: number
  flipRef: (id: string) => (el: HTMLLIElement | null) => void
  onToggleExclude: (id: string) => void
  onChangeQty: (id: string, delta: number) => void
  onAddToPantry: (label: string) => void
}) {
  const { name, detail } = getItemDisplay(item)
  const rowRef = useRef<HTMLLIElement | null>(null)
  const infoRef = useRef<HTMLDivElement | null>(null)
  const actionsRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (index > 1 || !rowRef.current || !infoRef.current || !actionsRef.current) return
    const row = rowRef.current
    const info = infoRef.current
    const actions = actionsRef.current
    const rowStyle = getComputedStyle(row)
    const infoStyle = getComputedStyle(info)
    const infoRect = info.getBoundingClientRect()
    const actionsRect = actions.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()
    const cssHasFlexColumn = [...document.styleSheets].some((sheet) => {
      try {
        return [...sheet.cssRules].some(
          (rule) =>
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes('.item-info') &&
            rule.style.flexDirection === 'column',
        )
      } catch {
        return false
      }
    })
    // #region agent log
    fetch('http://127.0.0.1:7864/ingest/04d8c24f-4c41-4b8c-855e-5197f10e445f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3159bb' },
      body: JSON.stringify({
        sessionId: '3159bb',
        runId: 'pre-fix',
        hypothesisId: 'H1-H5',
        location: 'ShoppingListPage.tsx:ItemRow',
        message: 'item row layout snapshot',
        data: {
          index,
          viewportWidth: window.innerWidth,
          displayData: { name, detail, aisle: item.aisle, rawText: item.rawText },
          rowDisplay: rowStyle.display,
          rowGridColumns: rowStyle.gridTemplateColumns,
          infoFlexDirection: infoStyle.flexDirection,
          infoGridColumn: infoStyle.gridColumn,
          infoGridRow: infoStyle.gridRow,
          actionsGridColumn: getComputedStyle(actions).gridColumn,
          actionsGridRow: getComputedStyle(actions).gridRow,
          cssHasItemInfoFlexColumn: cssHasFlexColumn,
          rects: {
            row: { w: rowRect.width, h: rowRect.height },
            info: { left: infoRect.left, w: infoRect.width, h: infoRect.height, relLeft: infoRect.left - rowRect.left },
            actions: { left: actionsRect.left, w: actionsRect.width, relLeft: actionsRect.left - rowRect.left },
            gapInfoToActions: actionsRect.left - (infoRect.left + infoRect.width),
          },
          aisleColor: item.aisle ? getComputedStyle(info.querySelector('.item-aisle')!).color : null,
          aisleBg: item.aisle ? getComputedStyle(info.querySelector('.item-aisle')!).backgroundColor : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [index, name, detail, item.aisle, item.rawText])

  return (
    <li
      key={item.id}
      ref={(el) => {
        rowRef.current = el
        flipRef(item.id)(el)
      }}
      className="item-row"
      style={{ '--i': index } as React.CSSProperties}
    >
      <button
        type="button"
        className="exclude-btn press"
        title="Remove from list"
        onClick={() => onToggleExclude(item.id)}
      >
        <IconCheck size={14} />
      </button>
      <div className="item-info" ref={infoRef}>
        <span className="item-name">{name}</span>
        {detail && <span className="item-detail">{detail}</span>}
        {item.aisle && <span className="item-aisle">{item.aisle}</span>}
      </div>
      <div className="item-actions" ref={actionsRef}>
        <div className="item-qty">
          <IconButton
            label="Decrease quantity"
            onClick={() => onChangeQty(item.id, -1)}
            disabled={item.quantityToBuy <= 1}
          >
            <IconMinus size={16} />
          </IconButton>
          <span>{item.quantityToBuy}</span>
          <IconButton label="Increase quantity" onClick={() => onChangeQty(item.id, 1)}>
            <IconPlus size={16} />
          </IconButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="item-price">${item.lineTotal.toFixed(2)}</span>
          <IconButton
            label="Save to pantry"
            onClick={() => {
              onAddToPantry(item.ingredientName)
              onToggleExclude(item.id)
            }}
          >
            <IconJar size={16} />
          </IconButton>
        </div>
      </div>
    </li>
  )
}

function ItemList({
  items,
  staples,
  onItemsChange,
  onAddToPantry,
}: {
  items: RecipeShoppingListItem[]
  staples: PantryStaple[]
  onItemsChange: (items: RecipeShoppingListItem[]) => void
  onAddToPantry: (label: string) => void
}) {
  const [localItems, setLocalItems] = useState(items)
  const itemIds = useMemo(() => localItems.map((i) => i.id), [localItems])
  const flipRef = useFlip(itemIds)
  const stapleSet = stapleLabels(staples)

  useEffect(() => {
    setLocalItems(applyPantryExclusions(items, staples))
  }, [items, staples])

  function updateItems(updater: (prev: RecipeShoppingListItem[]) => RecipeShoppingListItem[]) {
    setLocalItems((prev) => {
      const next = updater(prev)
      onItemsChange(next)
      return next
    })
  }

  function toggleExclude(id: string) {
    updateItems((prev) =>
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
    updateItems((prev) =>
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

  const active = localItems.filter((i) => !i.excluded && !i.notFound)
  const excluded = localItems.filter((i) => i.excluded)
  const notFound = localItems.filter((i) => i.notFound && !i.excluded)

  return (
    <>
      {active.length > 0 && (
        <ul className="item-list stagger">
          {active.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              index={index}
              flipRef={flipRef}
              onToggleExclude={toggleExclude}
              onChangeQty={changeQty}
              onAddToPantry={onAddToPantry}
            />
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
                  <span className="item-name">{getItemDisplay(item).name}</span>
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
          <div className="list-total-bar__amount">$<CountUp value={calcTotal(localItems)} /></div>
          <div className="list-total-bar__disclaimer">Prices are estimates</div>
        </div>
      </div>
    </>
  )
}

function RecipeCard({
  recipe,
  inCart,
  index,
  onOpen,
  onAddToCart,
  onRemoveFromCart,
}: {
  recipe: RecipeShoppingList
  inCart: boolean
  index: number
  onOpen: () => void
  onAddToCart: () => void
  onRemoveFromCart: () => void
}) {
  const count = activeCount(recipe.items)
  const total = calcTotal(recipe.items)

  return (
    <Card padding="none" className="recipe-card">
      <button type="button" className="recipe-card__main press" onClick={onOpen} style={{ '--i': index } as React.CSSProperties}>
        <div className="recipe-card__header">
          <h2 className="recipe-card__title">{recipe.recipeTitle}</h2>
          {recipe.sourceUrl && (
            <a
              className="recipe-card__link"
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternal size={14} />
            </a>
          )}
        </div>
        <p className="recipe-card__meta">
          {count} items · ${total.toFixed(2)} est. · {storeDisplayName(recipe.storeId)}
        </p>
      </button>
      <div className="recipe-card__footer">
        {inCart ? (
          <Button variant="secondary" size="sm" fullWidth onClick={onRemoveFromCart}>
            Remove from cart
          </Button>
        ) : (
          <Button size="sm" fullWidth onClick={onAddToCart}>
            Add all to cart
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function ShoppingListPage({
  collection,
  staples,
  onAddToPantry,
  onNewRecipe,
  onUpdateRecipe,
  onUpdateCart,
  onAddRecipeToCart,
  onRemoveRecipeFromCart,
  cartCount,
}: Props) {
  const [view, setView] = useState<View>({ kind: 'recipes' })
  const [manual, setManual] = useState('')
  const [adding, setAdding] = useState(false)

  const { recipes, cartItems, cartRecipeIds } = collection

  const selectedRecipe = view.kind === 'detail'
    ? recipes.find((r) => r.id === view.recipeId)
    : null

  if (recipes.length === 0) {
    return (
      <PageShell>
        <EmptyState
          icon={<IconReceipt size={28} />}
          title="No recipes yet"
          description="Paste a recipe URL or upload a screenshot to get started."
          action={{ label: 'Add a recipe', onClick: onNewRecipe }}
        />
      </PageShell>
    )
  }

  function CartButton() {
    return (
      <button
        type="button"
        className="cart-header-btn press"
        onClick={() => setView({ kind: 'cart' })}
        aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : 'Open cart'}
      >
        <IconCart size={22} />
        {cartCount > 0 && <span className="cart-header-btn__badge">{cartCount}</span>}
      </button>
    )
  }

  async function addManualToCart(e: React.FormEvent) {
    e.preventDefault()
    const text = manual.trim()
    if (!text || adding) return
    setAdding(true)
    try {
      const item = await matchIngredientLine(text)
      const [withPantry] = applyPantryExclusions([item], staples)
      onUpdateCart(mergeManualItem(cartItems, withPantry))
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

  function mergeManualItem(
    existing: RecipeShoppingListItem[],
    item: RecipeShoppingListItem,
  ): RecipeShoppingListItem[] {
    if (!item.productId || item.notFound) return [...existing, item]
    const match = existing.find((i) => i.productId === item.productId)
    if (!match) return [...existing, item]
    const qty = match.quantityToBuy + item.quantityToBuy
    return existing.map((i) =>
      i.id === match.id
        ? { ...i, quantityToBuy: qty, lineTotal: Math.round(qty * i.price * 100) / 100 }
        : i,
    )
  }

  if (view.kind === 'cart') {
    return (
      <PageShell
        title="Cart"
        trailing={
          <button type="button" className="back-btn press" onClick={() => setView({ kind: 'recipes' })}>
            <IconChevronLeft size={20} />
            Recipes
          </button>
        }
      >
        {cartItems.length === 0 ? (
          <EmptyState
            icon={<IconCart size={28} />}
            title="Your cart is empty"
            description="Add recipes from your list using the button on each card."
            action={{ label: 'View recipes', onClick: () => setView({ kind: 'recipes' }) }}
          />
        ) : (
          <>
            <Card padding="sm" className="manual-add">
              <form className="add-form" onSubmit={(e) => void addManualToCart(e)}>
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
            <ItemList
              items={cartItems}
              staples={staples}
              onItemsChange={onUpdateCart}
              onAddToPantry={onAddToPantry}
            />
          </>
        )}
      </PageShell>
    )
  }

  if (view.kind === 'detail' && selectedRecipe) {
    const inCart = cartRecipeIds.includes(selectedRecipe.id)

    return (
      <PageShell
        title={selectedRecipe.recipeTitle}
        trailing={
          <div className="header-actions">
            <CartButton />
            <button type="button" className="back-btn press" onClick={() => setView({ kind: 'recipes' })}>
              <IconChevronLeft size={20} />
              Back
            </button>
          </div>
        }
      >
        <div className="list-meta">
          <span>{storeDisplayName(selectedRecipe.storeId)} · {selectedRecipe.zipCode}</span>
          <span className="list-meta__sep" aria-hidden>·</span>
          <span>{activeCount(selectedRecipe.items)} items</span>
          {selectedRecipe.sourceUrl && (
            <>
              <span className="list-meta__sep" aria-hidden>·</span>
              <a className="source-link" href={selectedRecipe.sourceUrl} target="_blank" rel="noreferrer">
                View recipe <IconExternal size={14} />
              </a>
            </>
          )}
        </div>

        <ItemList
          items={selectedRecipe.items}
          staples={staples}
          onItemsChange={(items) => onUpdateRecipe(selectedRecipe.id, items)}
          onAddToPantry={onAddToPantry}
        />

        <div className="recipe-detail-actions">
          {inCart ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                onRemoveRecipeFromCart(selectedRecipe.id)
                showToast('Removed from cart', 'default')
              }}
            >
              Remove from cart
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={() => {
                onAddRecipeToCart(selectedRecipe.id)
                showToast('Added to cart', 'success')
              }}
            >
              Add all to cart
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onNewRecipe}>
            + Another recipe
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="My Recipes"
      trailing={<CartButton />}
    >
      <p className="subtitle" style={{ marginTop: '-12px', marginBottom: '16px' }}>
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
      </p>

      <div className="recipe-card-grid stagger">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            inCart={cartRecipeIds.includes(recipe.id)}
            index={index}
            onOpen={() => setView({ kind: 'detail', recipeId: recipe.id })}
            onAddToCart={() => {
              onAddRecipeToCart(recipe.id)
              showToast(`"${recipe.recipeTitle}" added to cart`, 'success')
            }}
            onRemoveFromCart={() => {
              onRemoveRecipeFromCart(recipe.id)
              showToast('Removed from cart', 'default')
            }}
          />
        ))}
      </div>

      <div className="recipe-list-footer">
        <Button variant="secondary" onClick={onNewRecipe}>
          + Add another recipe
        </Button>
      </div>
    </PageShell>
  )
}
