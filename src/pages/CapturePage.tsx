import { useState, useRef, useEffect } from 'react'
import type { RecipeShoppingList } from '../types/models.ts'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'
import { extractRecipeFromUrl, extractRecipeFromScreenshot } from '../services/api.ts'
import Card from '../components/Card.tsx'
import Button from '../components/Button.tsx'
import { IconLink, IconCamera } from '../components/icons.tsx'
import Spinner from '../components/Spinner.tsx'

interface Props {
  prefs: UserPrefs
  onListReady: (list: RecipeShoppingList) => void
  onGoToSettings: () => void
}

type Tab = 'url' | 'photo'

const LOADING_STEPS = ['Reading recipe…', 'Matching prices…', 'Almost done…']
const SAMPLE_URL = 'https://www.budgetbytes.com/creamy-tuscan-white-bean-skillet/'

export default function CapturePage({ prefs, onListReady, onGoToSettings }: Props) {
  const [tab, setTab] = useState<Tab>('url')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  const hasPrefs = Boolean(prefs.storeId && prefs.zipCode)

  useEffect(() => { urlRef.current?.focus() }, [])

  useEffect(() => {
    if (!loading) return
    setLoadingStep(0)
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 1200)
    return () => clearInterval(id)
  }, [loading])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  async function submitUrl(urlValue: string) {
    const trimmed = urlValue.trim()
    if (!trimmed) return
    setError(null)
    setLoading(true)
    try {
      const list = await extractRecipeFromUrl(trimmed, prefs)
      onListReady(list)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('402') || msg.includes('403') || msg.includes('401')) {
        setError('This site blocks automated requests. Try Budget Bytes, SimplyRecipes, or RecipeTinEats.')
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

  async function handleFile(file: File) {
    setError(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const list = await extractRecipeFromScreenshot(file, prefs)
      onListReady(list)
    } catch {
      setError('Could not read the screenshot. Make sure it shows a recipe with ingredients.')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="capture-layout">
      {/* Left: hero copy */}
      <div className="capture-hero">
        <button
          type="button"
          className={`store-chip${hasPrefs ? '' : ' store-chip--warn'}`}
          onClick={onGoToSettings}
        >
          {hasPrefs ? `Pricing for ${prefs.storeName} · ${prefs.zipCode}` : 'Tap to set your store'}
          <span aria-hidden> ›</span>
        </button>

        <h1 className="capture-hero__heading">
          Your groceries,<br />
          turned into a{' '}
          <em className="capture-hero__accent">priced cart</em>
        </h1>

        <p className="capture-hero__sub">
          Paste any recipe URL and we'll match every ingredient to real prices at your store — in seconds.
        </p>

        <ol className="capture-features">
          <li>
            <strong>Paste a recipe link</strong> from Budget Bytes, Simply Recipes, or any major cooking site
          </li>
          <li>
            <strong>We match every ingredient</strong> to real products and prices at your preferred store
          </li>
          <li>
            <strong>Your list is ready</strong> to review, adjust, and send straight to your cart
          </li>
        </ol>
      </div>

      {/* Right: input card */}
      <div className="capture-card-col">
        <Card>
          {loading ? (
            <div className="loading-card">
              <Spinner size="lg" />
              <p key={loadingStep} className="loading-card__label">{LOADING_STEPS[loadingStep]}</p>
              <div style={{ width: '100%' }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton skeleton--row" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="tabs" data-tab={tab}>
                <div className="tabs__indicator" aria-hidden />
                <button
                  type="button"
                  className="tabs__btn press"
                  aria-selected={tab === 'url'}
                  onClick={() => setTab('url')}
                >
                  <IconLink size={16} /> Paste link
                </button>
                <button
                  type="button"
                  className="tabs__btn press"
                  aria-selected={tab === 'photo'}
                  onClick={() => setTab('photo')}
                >
                  <IconCamera size={16} /> Photo
                </button>
              </div>

              {tab === 'url' ? (
                <form onSubmit={(e) => { e.preventDefault(); void submitUrl(url) }}>
                  <label className="capture-url-label">Recipe URL</label>
                  <input
                    ref={urlRef}
                    type="url"
                    className="url-input"
                    placeholder="https://www.budgetbytes.com/…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" fullWidth size="lg" disabled={!url.trim()}>
                    Build my list →
                  </Button>
                </form>
              ) : (
                <>
                  <div
                    className="photo-drop press"
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="Recipe preview" className="photo-preview" />
                    ) : (
                      <>
                        <IconCamera size={32} />
                        <span>Tap to upload a screenshot</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f) }}
                  />
                </>
              )}
            </>
          )}
        </Card>

        {!loading && tab === 'url' && (
          <button
            type="button"
            className="capture-sample-link"
            onClick={() => void submitUrl(SAMPLE_URL)}
          >
            Try a sample → <strong>Creamy Tuscan White Bean Skillet</strong>
          </button>
        )}

        <p className="capture-hint">Works well with budgetbytes.com · simplyrecipes.com · recipetineats.com</p>

        {error && (
          <div className="error-card">
            <p>{error}</p>
            {error.includes('blocks') && (
              <p className="error-card__tip">Tip: screenshot upload works on any site</p>
            )}
            <Button variant="ghost" size="sm" onClick={() => setError(null)} style={{ marginTop: 8 }}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
