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
  const [fileName, setFileName] = useState<string | null>(null)
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('402') || msg.includes('403') || msg.includes('401')) {
        setError('This site blocks automated requests. Try pasting from Budget Bytes, SimplyRecipes, or RecipeTinEats.')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('ENOTFOUND')) {
        setError("Could not reach that URL. Check it's correct and publicly accessible.")
      } else if (msg.includes('Missing title') || msg.includes('ingredients')) {
        setError("No recipe found on that page. Make sure it's a recipe URL.")
      } else {
        setError('Could not extract recipe. Try a different URL.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError(null)
    setLoading(true)
    try {
      const list = await extractRecipeFromScreenshot(file, prefs)
      onListReady(list)
    } catch {
      setError('Could not read the screenshot. Make sure it shows a recipe with ingredients.')
    } finally {
      setLoading(false)
      setFileName(null)
      if (fileRef.current) fileRef.current.value = ''
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
          <span>No store set — prices will use defaults</span>
          <button className="link-btn" onClick={onGoToSettings}>Set up</button>
        </div>
      )}

      <form className="url-form" onSubmit={handleUrlSubmit}>
        <input
          type="url"
          placeholder="https://www.budgetbytes.com/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading && !fileName ? 'Extracting…' : 'Get List'}
        </button>
      </form>

      <div className="divider">or</div>

      <button
        className="upload-btn"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        {loading && fileName ? `Reading ${fileName}…` : 'Upload Screenshot'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {loading && (
        <p className="loading-hint">Extracting recipe and matching prices…</p>
      )}

      {error && (
        <div className="error-box">
          <p>{error}</p>
          {error.includes('blocks') && (
            <p className="error-tip">Works well with: budgetbytes.com · simplyrecipes.com · recipetineats.com</p>
          )}
        </div>
      )}
    </div>
  )
}
