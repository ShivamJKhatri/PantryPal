import { useState, useRef } from 'react'
import type { RecipeShoppingList } from '../types/models.ts'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'
import { extractRecipeFromUrl, extractRecipeFromScreenshot } from '../services/api.ts'

interface Props {
  prefs: UserPrefs
  onListReady: (list: RecipeShoppingList) => void
  onGoToSettings: () => void
}

export default function CapturePage({ prefs, onListReady, onGoToSettings }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasPrefs = Boolean(prefs.storeId && prefs.zipCode)

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setError(null)
    setLoading(true)
    try {
      const list = await extractRecipeFromUrl(url.trim(), prefs)
      onListReady(list)
    } catch {
      setError('Could not extract recipe. Check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const list = await extractRecipeFromScreenshot(file, prefs)
      onListReady(list)
    } catch {
      setError('Could not read screenshot. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="capture-page">
      <h1>Add a Recipe</h1>
      <p className="subtitle">Paste a recipe URL or upload a screenshot to get a priced shopping list.</p>

      {hasPrefs ? (
        <div className="store-badge">
          <span>{prefs.storeName} · {prefs.zipCode}</span>
          <button className="link-btn" onClick={onGoToSettings}>Change</button>
        </div>
      ) : (
        <div className="store-badge warn">
          <span>No store set</span>
          <button className="link-btn" onClick={onGoToSettings}>Set up now</button>
        </div>
      )}

      <form className="url-form" onSubmit={handleUrlSubmit}>
        <input
          type="url"
          placeholder="https://www.example.com/recipe..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? 'Extracting…' : 'Get List'}
        </button>
      </form>

      <div className="divider">or</div>

      <button
        className="upload-btn"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        Upload Screenshot
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {error && <p className="error">{error}</p>}
    </div>
  )
}
