import { useState, useEffect, useMemo } from 'react'
import type { PantryStaple, RecipeCollection, RecipeShoppingList, RecipeShoppingListItem, SuggestionItem, StoreOption } from '../types/models.ts'
import { STORE_OPTIONS } from './SettingsPage.tsx'
import { matchIngredientLine, getStoreOptions } from '../services/api.ts'
import { detectAllergens } from '../lib/allergens.ts'
import { showToast } from '../hooks/useToast.ts'
import { getItemDisplay } from '../lib/display-item.ts'
import { calcActiveTotal } from '../lib/merge-items.ts'
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
import type { ListView } from '../lib/app-history.ts'

function storeDisplayName(storeId: string): string {
  return STORE_OPTIONS.find((s) => s.id === storeId)?.name ?? storeId
}

interface Props {
  collection: RecipeCollection
  staples: PantryStaple[]
  onAddToPantry: (label: string) => void
  onRemoveFromPantry: (stapleId: string) => void
  onNewRecipe: () => void
  onUpdateRecipe: (recipeId: string, items: RecipeShoppingListItem[]) => void
  onUpdateCart: (items: RecipeShoppingListItem[]) => void
  onAddRecipeToCart: (recipeId: string) => void
  onRemoveRecipeFromCart: (recipeId: string) => void
  onRemoveRecipe: (recipeId: string) => void
  cartCount: number
  view: ListView
  onViewChange: (view: ListView) => void
  onBack: () => void
  onGoToSettings: () => void
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

function recipeListStats(items: RecipeShoppingListItem[], staples: PantryStaple[]) {
  const adjusted = applyPantryExclusions(items, staples)
  return { count: activeCount(adjusted), total: calcActiveTotal(adjusted) }
}

function ItemRow({
  item,
  index,
  flipRef,
  onToggleExclude,
  onChangeQty,
  onAddToPantry,
  shoppingMode = false,
  isBought = false,
  onBuy,
}: {
  item: RecipeShoppingListItem
  index: number
  flipRef: (id: string) => (el: HTMLLIElement | null) => void
  onToggleExclude: (id: string) => void
  onChangeQty: (id: string, delta: number) => void
  onAddToPantry: (label: string) => void
  shoppingMode?: boolean
  isBought?: boolean
  onBuy?: () => void
}) {
  const { name, detail } = getItemDisplay(item)

  return (
    <li
      key={item.id}
      ref={flipRef(item.id)}
      className={`item-row${isBought ? ' item-row--bought' : ''}`}
      style={{ '--i': index, cursor: shoppingMode ? 'pointer' : undefined } as React.CSSProperties}
      onClick={shoppingMode && onBuy ? () => onBuy() : undefined}
    >
      <button
        type="button"
        className={`exclude-btn press${isBought ? ' bought' : shoppingMode ? ' shopping-mode' : ''}`}
        title={isBought ? 'Bought' : shoppingMode ? 'Mark as bought & save to pantry' : 'Remove from list'}
        onClick={(e) => {
          e.stopPropagation()
          if (onBuy) { onBuy(); return }
          onToggleExclude(item.id)
        }}
      >
        <IconCheck size={14} />
      </button>
      <div className="item-info">
        <div className="item-name-row">
          <span className="item-name">{name}</span>
          {item.confidence !== undefined && item.confidence < 0.75 && (
            <span className="item-confidence-warn" title={`Low extraction confidence (${Math.round(item.confidence * 100)}%) — double-check this ingredient`}>
              ⚠
            </span>
          )}
        </div>
        {detail && <span className="item-detail">{detail}</span>}
        {item.aisle && <span className="item-aisle">{item.aisle}</span>}
      </div>
      <div className="item-actions" onClick={(e) => e.stopPropagation()}>
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
  shoppingMode = false,
  onRemoveFromPantry,
}: {
  items: RecipeShoppingListItem[]
  staples: PantryStaple[]
  onItemsChange: (items: RecipeShoppingListItem[]) => void
  onAddToPantry: (label: string) => void
  shoppingMode?: boolean
  onRemoveFromPantry?: (stapleId: string) => void
}) {
  const [localItems, setLocalItems] = useState(() => applyPantryExclusions(items, staples))
  const [boughtIds, setBoughtIds] = useState<Map<string, string>>(new Map()) // id → ingredientName
  const itemIds = useMemo(() => localItems.map((i) => i.id), [localItems])
  const flipRef = useFlip(itemIds)

  useEffect(() => {
    setLocalItems(applyPantryExclusions(items, staples))
  }, [items, staples])

  useEffect(() => {
    if (!shoppingMode && boughtIds.size > 0) {
      boughtIds.forEach((name) => onAddToPantry(name))
      setBoughtIds(new Map())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingMode])

  function updateItems(updater: (prev: RecipeShoppingListItem[]) => RecipeShoppingListItem[]) {
    const next = updater(localItems)
    setLocalItems(next)
    onItemsChange(next)
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

  function acceptSuggestion(itemId: string, suggestion: SuggestionItem) {
    updateItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        return {
          ...item,
          productId: suggestion.productId,
          productName: suggestion.productName,
          ingredientName: suggestion.productName,
          aisle: suggestion.aisle,
          price: suggestion.price,
          quantityToBuy: 1,
          lineTotal: suggestion.price,
          notFound: false,
          suggestions: undefined,
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

  function buyItem(id: string, ingredientName: string) {
    setBoughtIds((prev) => new Map(prev).set(id, ingredientName))
  }

  function unbuyItem(id: string) {
    setBoughtIds((prev) => { const next = new Map(prev); next.delete(id); return next })
  }

  function ranOut(item: RecipeShoppingListItem, stapleId: string) {
    onRemoveFromPantry?.(stapleId)
    const qty = Math.max(1, item.quantityToBuy || 1)
    const restored = { ...item, excluded: false, quantityToBuy: qty, lineTotal: Math.round(qty * item.price * 100) / 100 }
    const next = localItems.map((i) => (i.id === item.id ? restored : i))
    setLocalItems(next)
    onItemsChange(next)
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
              shoppingMode={shoppingMode}
              isBought={boughtIds.has(item.id)}
              onBuy={shoppingMode ? () => boughtIds.has(item.id) ? unbuyItem(item.id) : buyItem(item.id, item.ingredientName) : undefined}
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
              <li key={item.id} className="item-row item-row--not-found">
                <div className="item-info">
                  <span className="item-name">{item.rawText}</span>
                  {item.suggestions && item.suggestions.length > 0 && (
                    <div className="item-suggestions">
                      <span className="item-suggestions__label">Try instead:</span>
                      {item.suggestions.map((s) => (
                        <button
                          key={s.productId}
                          type="button"
                          className="suggestion-chip press"
                          onClick={() => acceptSuggestion(item.id, s)}
                        >
                          {s.productName} · ${s.price.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}

      {excluded.length > 0 && (
        <details className="section-details" open={active.length === 0}>
          <summary>Excluded / in pantry ({excluded.length})</summary>
          <ul className="item-list muted stagger">
            {excluded.map((item, index) => {
              const matchingStaple = staples.find((s) => {
                const fields = [item.ingredientName, item.rawText, item.productName].map((f) => f.toLowerCase())
                return fields.some((f) => f.includes(s.label.toLowerCase()))
              })
              return (
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
                    {matchingStaple ? (
                      <div className="item-pantry-tag-row">
                        <span className="item-pantry-tag">In pantry</span>
                        <button
                          type="button"
                          className="remove-pantry-btn press"
                          title="Remove from pantry — ran out?"
                          onClick={() => ranOut(item, matchingStaple.id)}
                        >
                          Ran out
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <span className="item-price">—</span>
                </li>
              )
            })}
          </ul>
        </details>
      )}

      <div className="list-total-bar">
        <div>
          <div className="list-total-bar__meta">{active.length} items · estimated</div>
          <div className="list-total-bar__amount">$<CountUp value={calcActiveTotal(localItems)} /></div>
          <div className="list-total-bar__disclaimer">Prices are estimates</div>
        </div>
      </div>
    </>
  )
}


function RecipeDetailView({
  recipe,
  staples,
  inCart,
  onNewRecipe,
  onUpdateRecipe,
  onAddToPantry,
  onRemoveFromPantry,
  onAddToCart,
  onRemoveFromCart,
  onBack,
  onGoToSettings,
}: {
  recipe: RecipeShoppingList
  staples: PantryStaple[]
  inCart: boolean
  onNewRecipe: () => void
  onUpdateRecipe: (items: RecipeShoppingListItem[]) => void
  onAddToPantry: (label: string) => void
  onRemoveFromPantry: (stapleId: string) => void
  onAddToCart: () => void
  onRemoveFromCart: () => void
  onBack: () => void
  onGoToSettings: () => void
}) {
  const [tab, setTab] = useState<'list' | 'recipe'>('list')
  const [stores, setStores] = useState<StoreOption[] | null>(null)
  const [gasPrice, setGasPrice] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)

  const stableTotal = Math.round(calcActiveTotal(applyPantryExclusions(recipe.items, staples)) * 2) / 2

  useEffect(() => {
    if (!recipe.zipCode) return
    getStoreOptions(recipe.zipCode, stableTotal)
      .then((r) => {
        setStores(r.stores)
        setGasPrice(r.gasPrice)
        // default to cheapest (first in sorted list)
        setSelectedStoreId(r.stores[0]?.id ?? null)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.zipCode])

  const selectedStore = stores?.find((s) => s.id === selectedStoreId) ?? stores?.[0] ?? null

  const hasRecipeContent = (recipe.recipeSteps && recipe.recipeSteps.length > 0) ||
    recipe.recipeDescription || recipe.recipeServings ||
    recipe.recipePrepTime || recipe.recipeCookTime

  const allItems = applyPantryExclusions(recipe.items, staples)
  const activeItems = allItems.filter((i) => !i.excluded && !i.notFound)
  const pantryExcluded = allItems.filter((i) => i.excluded)
  const baseTotal = calcActiveTotal(allItems)
  const totalSaved = recipe.items.reduce((s, i) => s + i.price, 0) - baseTotal
  const allergens = detectAllergens(recipe.items)

  // Grocery total at selected store (from API) or base total
  const groceryTotal = selectedStore?.groceryEstimate ?? baseTotal
  const travelCost = selectedStore?.travelCost ?? 0
  const grandTotal = groceryTotal + travelCost

  return (
    <PageShell>
      <div className="list-detail-layout">
        {/* Left: main content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
            <div>
              <h1 className="list-detail-title">{recipe.recipeTitle}</h1>
              <div className="list-meta">
                <span>{activeItems.length} items</span>
                {recipe.sourceUrl && (
                  <>
                    <span className="list-meta__sep" aria-hidden>·</span>
                    <a className="source-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                      View source <IconExternal size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
            <button type="button" className="list-detail-new-recipe" onClick={onNewRecipe}>
              + New recipe
            </button>
          </div>

          {allergens.length > 0 && (
            <div className="allergen-bar">
              <span className="allergen-bar__label">Contains</span>
              {allergens.map((a) => (
                <span key={a} className="allergen-chip">{a}</span>
              ))}
            </div>
          )}

          {/* Store picker — full comparison for this recipe */}
          <div className="store-picker-card">
            <div className="store-picker-header">
              <span className="store-picker-title">Pick a store for this recipe</span>
              {gasPrice !== null && recipe.zipCode && (
                <span className="store-picker-meta">
                  near {recipe.zipCode} · ${gasPrice.toFixed(2)}/gal
                </span>
              )}
              {!recipe.zipCode && (
                <button type="button" className="store-picker-set-zip press" onClick={onGoToSettings}>
                  Set ZIP →
                </button>
              )}
            </div>

            {!recipe.zipCode ? (
              <p className="store-picker-no-zip">Add a ZIP code in Settings to compare store prices and distances.</p>
            ) : stores === null ? (
              <div className="store-picker-loading">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="store-picker-skeleton" />
                ))}
              </div>
            ) : (
              <ul className="store-picker-list">
                {stores.map((store, i) => {
                  const isSelected = store.id === selectedStoreId
                  const isBest = i === 0
                  const storeCheapest = store.groceryEstimate !== null
                    ? store.groceryEstimate + store.travelCost
                    : null
                  const savings = stores[0].totalWithTravel - store.totalWithTravel

                  return (
                    <li key={store.id}>
                      <button
                        type="button"
                        className={`store-picker-row press${isSelected ? ' selected' : ''}`}
                        onClick={() => setSelectedStoreId(store.id)}
                      >
                        <div className="store-picker-row__left">
                          <div className="store-picker-row__radio">
                            <div className={`store-picker-dot${isSelected ? ' filled' : ''}`} />
                          </div>
                          <div className="store-picker-row__info">
                            <div className="store-picker-row__name">
                              {store.name}
                              {isBest && <span className="store-picker-badge">Best value</span>}
                            </div>
                            <div className="store-picker-row__sub">
                              {store.distance} mi away · ${store.travelCost.toFixed(2)} gas (round trip)
                            </div>
                          </div>
                        </div>
                        <div className="store-picker-row__right">
                          {storeCheapest !== null ? (
                            <>
                              <span className="store-picker-row__total">${storeCheapest.toFixed(2)}</span>
                              <span className="store-picker-row__breakdown">
                                ${store.groceryEstimate!.toFixed(2)} groceries + ${store.travelCost.toFixed(2)} gas
                              </span>
                              {!isBest && savings > 0.01 && (
                                <span className="store-picker-row__extra">+${savings.toFixed(2)} vs best</span>
                              )}
                            </>
                          ) : (
                            <span className="store-picker-row__total">${store.travelCost.toFixed(2)} gas</span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {hasRecipeContent && (
            <div className="detail-tabs" data-tab={tab}>
              <div className="detail-tabs__indicator" />
              <button type="button" className="detail-tabs__btn" aria-selected={tab === 'list'} onClick={() => setTab('list')}>
                Shopping list
              </button>
              <button type="button" className="detail-tabs__btn" aria-selected={tab === 'recipe'} onClick={() => setTab('recipe')}>
                Recipe
              </button>
            </div>
          )}

          {tab === 'list' ? (
            <>
              {pantryExcluded.length > 0 && (
                <div className="pantry-savings-banner">
                  <div className="pantry-savings-banner__icon"><IconCheck size={14} /></div>
                  <div className="pantry-savings-banner__body">
                    <div className="pantry-savings-banner__title">Pantry savings</div>
                    <div className="pantry-savings-banner__sub">
                      {pantryExcluded.map((i) => getItemDisplay(i).name).slice(0, 3).join(', ')}
                      {pantryExcluded.length > 3 ? ` +${pantryExcluded.length - 3} more` : ''} already on hand
                    </div>
                  </div>
                  {totalSaved > 0 && <span className="pantry-savings-banner__amount">-${totalSaved.toFixed(2)}</span>}
                </div>
              )}
              <ItemList
                items={recipe.items}
                staples={staples}
                onItemsChange={onUpdateRecipe}
                onAddToPantry={onAddToPantry}
                onRemoveFromPantry={onRemoveFromPantry}
              />
            </>
          ) : (
            <div className="recipe-view">
              {(recipe.recipeServings || recipe.recipePrepTime || recipe.recipeCookTime) && (
                <div className="recipe-meta-bar">
                  {recipe.recipeServings && (
                    <div className="recipe-meta-chip">
                      <span className="recipe-meta-chip__label">Serves</span>
                      <span className="recipe-meta-chip__value">{recipe.recipeServings}</span>
                    </div>
                  )}
                  {recipe.recipePrepTime && (
                    <div className="recipe-meta-chip">
                      <span className="recipe-meta-chip__label">Prep</span>
                      <span className="recipe-meta-chip__value">{recipe.recipePrepTime}</span>
                    </div>
                  )}
                  {recipe.recipeCookTime && (
                    <div className="recipe-meta-chip">
                      <span className="recipe-meta-chip__label">Cook</span>
                      <span className="recipe-meta-chip__value">{recipe.recipeCookTime}</span>
                    </div>
                  )}
                </div>
              )}
              {recipe.recipeDescription && (
                <p className="recipe-description">{recipe.recipeDescription}</p>
              )}
              {recipe.recipeSteps && recipe.recipeSteps.length > 0 ? (
                <ol className="recipe-steps">
                  {recipe.recipeSteps.map((step, i) => (
                    <li key={i} className="recipe-step">
                      <span className="recipe-step__num">{i + 1}</span>
                      <p className="recipe-step__text">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="recipe-no-steps">No instructions were found for this recipe.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: cart sidebar — reflects selected store */}
        <div className="list-sidebar">
          <div className="list-sidebar-card">
            <div className="list-sidebar-title">
              {selectedStore ? selectedStore.name : 'Your cart'}
            </div>
            {selectedStore && (
              <div className="list-sidebar-store">
                <span className="list-sidebar-store-dot" />
                {selectedStore.distance} mi · ${selectedStore.travelCost.toFixed(2)} gas
              </div>
            )}
            <div className="list-sidebar-rows">
              <div className="list-sidebar-row">
                <span>{activeItems.length} items</span>
                <span>{selectedStore?.groceryEstimate !== null && selectedStore ? `$${selectedStore.groceryEstimate!.toFixed(2)}` : `$${baseTotal.toFixed(2)}`}</span>
              </div>
              {selectedStore && (
                <div className="list-sidebar-row">
                  <span>Gas (round trip)</span>
                  <span>+${selectedStore.travelCost.toFixed(2)}</span>
                </div>
              )}
              {pantryExcluded.length > 0 && totalSaved > 0 && (
                <div className="list-sidebar-row">
                  <span>Pantry savings</span>
                  <span style={{ color: 'var(--success)' }}>-${totalSaved.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="list-sidebar-total">
              <span className="list-sidebar-total__label">Total with gas</span>
              <span className="list-sidebar-total__amount">$<CountUp value={grandTotal} /></span>
              <span className="list-sidebar-total__note">Groceries + round-trip gas · estimates only</span>
            </div>
            <div className="list-sidebar-actions">
              {inCart ? (
                <Button variant="secondary" fullWidth onClick={onRemoveFromCart}>Remove from cart</Button>
              ) : (
                <Button fullWidth onClick={onAddToCart}>Send to cart</Button>
              )}
              <Button variant="secondary" fullWidth onClick={onBack}>Back to recipes</Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function RecipeCard({
  recipe,
  staples,
  inCart,
  index,
  onOpen,
  onAddToCart,
  onRemoveFromCart,
  onDelete,
}: {
  recipe: RecipeShoppingList
  staples: PantryStaple[]
  inCart: boolean
  index: number
  onOpen: () => void
  onAddToCart: () => void
  onRemoveFromCart: () => void
  onDelete: () => void
}) {
  const { count, total } = recipeListStats(recipe.items, staples)
  const allergens = detectAllergens(recipe.items)

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
              title="View original recipe source"
            >
              <IconExternal size={14} />
            </a>
          )}
        </div>
        <p className="recipe-card__meta">
          {count} items · ${total.toFixed(2)} est. · {storeDisplayName(recipe.storeId)}
        </p>
        {allergens.length > 0 && (
          <div className="recipe-card__allergens">
            {allergens.slice(0, 3).map((a) => (
              <span key={a} className="allergen-chip">{a}</span>
            ))}
            {allergens.length > 3 && (
              <span className="allergen-chip allergen-chip--more">+{allergens.length - 3} more</span>
            )}
          </div>
        )}
      </button>
      <div className="recipe-card__footer">
        {inCart ? (
          <Button variant="secondary" size="sm" fullWidth onClick={onRemoveFromCart} title="Remove all ingredients from your cart">
            Remove from cart
          </Button>
        ) : (
          <Button size="sm" fullWidth onClick={onAddToCart} title="Add all ingredients to your shopping cart">
            Add all to cart
          </Button>
        )}
        <Button variant="ghost" size="sm" fullWidth className="recipe-card__delete" onClick={onDelete}>
          Delete recipe
        </Button>
      </div>
    </Card>
  )
}

export default function ShoppingListPage({
  collection,
  staples,
  onAddToPantry,
  onRemoveFromPantry,
  onNewRecipe,
  onUpdateRecipe,
  onUpdateCart,
  onAddRecipeToCart,
  onRemoveRecipeFromCart,
  onRemoveRecipe,
  cartCount,
  view,
  onViewChange,
  onBack,
  onGoToSettings,
}: Props) {
  const [manual, setManual] = useState('')
  const [adding, setAdding] = useState(false)
  const [shoppingMode, setShoppingMode] = useState(false)

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
        onClick={() => onViewChange({ kind: 'cart' })}
        aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : 'Open cart'}
        title={cartCount > 0 ? `Open cart — ${cartCount} recipe${cartCount !== 1 ? 's' : ''} added` : 'Open cart'}
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
    if (!item.productId || item.notFound) return [item, ...existing]
    const match = existing.find((i) => i.productId === item.productId)
    if (!match) return [item, ...existing]
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className={`shopping-toggle-btn press${shoppingMode ? ' active' : ''}`}
              onClick={() => setShoppingMode((m) => !m)}
            >
              {shoppingMode ? 'Done' : 'Start Shopping'}
            </button>
            <button type="button" className="back-btn press" onClick={onBack}>
              <IconChevronLeft size={20} />
              Recipes
            </button>
          </div>
        }
      >
        {cartItems.length === 0 ? (
          <EmptyState
            icon={<IconCart size={28} />}
            title="Your cart is empty"
            description="Add recipes from your list using the button on each card."
            action={{ label: 'View recipes', onClick: () => onViewChange({ kind: 'recipes' }) }}
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
              shoppingMode={shoppingMode}
              onRemoveFromPantry={onRemoveFromPantry}
            />
          </>
        )}
      </PageShell>
    )
  }

  if (view.kind === 'detail' && selectedRecipe) {
    return (
      <RecipeDetailView
        recipe={selectedRecipe}
        staples={staples}
        inCart={cartRecipeIds.includes(selectedRecipe.id)}
        onNewRecipe={onNewRecipe}
        onUpdateRecipe={(items) => onUpdateRecipe(selectedRecipe.id, items)}
        onAddToPantry={onAddToPantry}
        onRemoveFromPantry={onRemoveFromPantry}
        onAddToCart={() => { onAddRecipeToCart(selectedRecipe.id); showToast('Added to cart', 'success') }}
        onRemoveFromCart={() => { onRemoveRecipeFromCart(selectedRecipe.id); showToast('Removed from cart', 'default') }}
        onBack={onBack}
        onGoToSettings={onGoToSettings}
      />
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
            staples={staples}
            inCart={cartRecipeIds.includes(recipe.id)}
            index={index}
            onOpen={() => onViewChange({ kind: 'detail', recipeId: recipe.id })}
            onAddToCart={() => {
              onAddRecipeToCart(recipe.id)
              showToast(`"${recipe.recipeTitle}" added to cart`, 'success')
            }}
            onRemoveFromCart={() => {
              onRemoveRecipeFromCart(recipe.id)
              showToast('Removed from cart', 'default')
            }}
            onDelete={() => {
              onRemoveRecipe(recipe.id)
              showToast('Recipe deleted', 'default')
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
