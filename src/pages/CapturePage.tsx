import { useState, useRef } from 'react'
import type { ShoppingList } from '../types/models.ts'
import { extractRecipeFromUrl, extractRecipeFromScreenshot } from '../services/api.ts'

interface Props {
  onListReady: (list: ShoppingList) => void
}

export default function CapturePage({ onListReady }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setError(null)
    setLoading(true)
    try {
      const list = await extractRecipeFromUrl(url.trim())
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
      const list = await extractRecipeFromScreenshot(file)
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
