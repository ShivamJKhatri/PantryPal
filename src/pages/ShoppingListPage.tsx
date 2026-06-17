import type { ShoppingList } from '../types/models.ts'
import { getStoreProductById, getNormalizedIngredientById } from '../data/mock-data.ts'

interface Props {
  list: ShoppingList | null
}

export default function ShoppingListPage({ list }: Props) {
  if (!list) {
    return (
      <div className="empty-state">
        <p>No shopping list yet. Add a recipe to get started.</p>
      </div>
    )
  }

  const activeItems = list.items.filter((item) => !item.excluded)
  const excludedItems = list.items.filter((item) => item.excluded)

  return (
    <div className="list-page">
      <h1>Shopping List</h1>
      <p className="subtitle">Store: {list.storeId} · Zip: {list.zipCode}</p>

      <ul className="item-list">
        {activeItems.map((item) => {
          const ingredient = getNormalizedIngredientById(item.normalizedIngredientId)
          const product = getStoreProductById(item.storeProductId)
          return (
            <li key={item.id} className="item-row">
              <span className="item-name">{ingredient?.name ?? item.normalizedIngredientId}</span>
              <span className="item-product">{product?.name}</span>
              <span className="item-price">${item.lineTotal.toFixed(2)}</span>
            </li>
          )
        })}
      </ul>

      {excludedItems.length > 0 && (
        <details className="excluded-section">
          <summary>Already in pantry ({excludedItems.length})</summary>
          <ul className="item-list muted">
            {excludedItems.map((item) => {
              const ingredient = getNormalizedIngredientById(item.normalizedIngredientId)
              return (
                <li key={item.id} className="item-row">
                  <span className="item-name">{ingredient?.name ?? item.normalizedIngredientId}</span>
                  <span className="item-price">—</span>
                </li>
              )
            })}
          </ul>
        </details>
      )}

      <div className="list-total">
        <span>Estimated total</span>
        <strong>${list.estimatedTotal.toFixed(2)}</strong>
      </div>
    </div>
  )
}
