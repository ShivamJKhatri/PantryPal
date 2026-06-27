import { useState, useEffect } from 'react'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'
import type { StoreOption } from '../types/models.ts'
import { getStoreOptions } from '../services/api.ts'
import PageShell from '../components/PageShell.tsx'
import Button from '../components/Button.tsx'
import Spinner from '../components/Spinner.tsx'
import { IconCheck } from '../components/icons.tsx'

export const STORE_OPTIONS = [
  { id: 'store-kroger',     name: 'Kroger' },
  { id: 'store-walmart',    name: 'Walmart' },
  { id: 'store-target',     name: 'Target' },
  { id: 'store-wholefoods', name: 'Whole Foods' },
  { id: 'store-safeway',    name: 'Safeway' },
  { id: 'store-publix',     name: 'Publix' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        className="toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" />
      <span className="toggle__thumb" />
    </label>
  )
}

interface Props {
  prefs: UserPrefs
  onSave: (prefs: UserPrefs) => void
  isOnboarding?: boolean
}

export default function SettingsPage({ prefs, onSave, isOnboarding }: Props) {
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState(prefs.storeId || '')
  const [zipCode, setZipCode] = useState(prefs.zipCode || '')
  const [zipError, setZipError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [cheapestMatch, setCheapestMatch] = useState(prefs.cheapestMatch ?? true)
  const [flagLowConfidence, setFlagLowConfidence] = useState(prefs.flagLowConfidence ?? true)
  const [storeOptions, setStoreOptions] = useState<StoreOption[] | null>(null)
  const [gasPrice, setGasPrice] = useState<number | null>(null)
  const [loadingStores, setLoadingStores] = useState(false)
  const [storesError, setStoresError] = useState('')

  // Auto-fetch on mount and when storeOptions is cleared (e.g. after ZIP change)
  useEffect(() => {
    if (prefs.zipCode && /^\d{5}$/.test(prefs.zipCode) && !isOnboarding && !storeOptions && !loadingStores) {
      void fetchStores(prefs.zipCode)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeOptions])

  useEffect(() => {
    if (editing && zipCode && /^\d{5}$/.test(zipCode) && !storeOptions) {
      void fetchStores(zipCode)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  async function fetchStores(zip: string) {
    setLoadingStores(true)
    setStoresError('')
    try {
      const result = await getStoreOptions(zip)
      setStoreOptions(result.stores)
      setGasPrice(result.gasPrice)
      if (!storeId && result.stores.length > 0) {
        setStoreId(result.stores[0].id)
      }
    } catch {
      setStoresError('Could not load nearby stores. Pick one manually.')
      if (isOnboarding) setStep(2)
    } finally {
      setLoadingStores(false)
    }
  }

  function switchStore(newStoreId: string) {
    const storeName =
      storeOptions?.find((o) => o.id === newStoreId)?.name ??
      STORE_OPTIONS.find((s) => s.id === newStoreId)?.name ?? ''
    onSave({ ...prefs, storeId: newStoreId, storeName })
  }

  function validateZip(): boolean {
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setZipError('Enter a valid 5-digit ZIP code')
      return false
    }
    setZipError('')
    return true
  }

  async function advanceToStores() {
    if (!validateZip()) return
    await fetchStores(zipCode.trim())
    setStep(2)
  }

  function finish() {
    if (!storeId) return
    const storeName =
      storeOptions?.find((o) => o.id === storeId)?.name ??
      STORE_OPTIONS.find((s) => s.id === storeId)?.name ?? ''
    setSaving(true)
    onSave({ storeId, storeName, zipCode: zipCode.trim(), cheapestMatch, flagLowConfidence })
  }

  function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { void advanceToStores(); return }
    finish()
  }

  // ── Store rank list (shared between onboarding step 2 and edit mode) ──────
  function StoreRankSection({ zip }: { zip: string }) {
    return (
      <>
        {loadingStores ? (
          <div className="store-loading">
            <Spinner size="sm" /> Finding stores near you…
          </div>
        ) : storesError ? (
          <>
            <p className="field-error" style={{ marginBottom: 'var(--s-3)' }}>{storesError}</p>
            <FallbackStoreGrid />
          </>
        ) : storeOptions ? (
          <>
            <ul className="store-rank-list">
              {storeOptions.map((opt, i) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`store-rank-btn press${storeId === opt.id ? ' selected' : ''}`}
                    onClick={() => setStoreId(opt.id)}
                  >
                    <div className="store-rank-info">
                      {i === 0 && <span className="store-rank-badge">Best value</span>}
                      <span className="store-rank-name">{opt.name}</span>
                      <span className="store-rank-dist">{opt.distance} mi · ${opt.travelCost.toFixed(2)} gas</span>
                    </div>
                    <div className="store-rank-right">
                      {storeId === opt.id && <IconCheck size={15} className="store-rank-check" />}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {gasPrice !== null && (
              <p className="store-rank-note">
                Estimated distances · ${gasPrice.toFixed(2)}/gal · ~28 mpg round trip
              </p>
            )}
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void fetchStores(zip)}
            disabled={zip.length !== 5}
          >
            Find stores near {zip}
          </Button>
        )}
      </>
    )
  }

  function FallbackStoreGrid() {
    return (
      <div className="store-grid">
        {STORE_OPTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`store-btn press${storeId === s.id ? ' selected' : ''}`}
            onClick={() => setStoreId(s.id)}
          >
            {storeId === s.id && (
              <span className="store-btn__check" aria-hidden>
                <IconCheck size={14} />
              </span>
            )}
            {s.name}
          </button>
        ))}
      </div>
    )
  }

  // ── Onboarding flow (ZIP first → ranked stores) ───────────────────────────
  if (isOnboarding) {
    return (
      <PageShell
        title="Welcome to PantryPal"
        subtitle={
          step === 1
            ? 'Enter your ZIP to find the best store nearby'
            : 'Pick the store with the best value'
        }
      >
        <div className="settings-steps" aria-hidden>
          <span className={`settings-step-dot${step >= 1 ? ' settings-step-dot--active' : ''}`} />
          <span className={`settings-step-dot${step >= 2 ? ' settings-step-dot--active' : ''}`} />
        </div>

        <form className="settings-form" onSubmit={handleOnboardingSubmit}>
          {step === 1 && (
            <div className="settings-panel settings-field">
              <label htmlFor="zip">Your ZIP code</label>
              <input
                id="zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 10001"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, ''))
                  if (storeOptions) setStoreOptions(null)
                }}
              />
              {zipError && <span className="field-error">{zipError}</span>}
            </div>
          )}

          {step === 2 && (
            <div className="settings-panel settings-field">
              <label>
                {storeOptions ? `Stores near ${zipCode} — sorted by best value` : 'Preferred store'}
              </label>
              <StoreRankSection zip={zipCode} />
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={saving || loadingStores}
            disabled={step === 2 && !storeId}
          >
            {step === 1 ? 'Find stores' : 'Get started'}
          </Button>
        </form>
      </PageShell>
    )
  }

  // ── Edit mode (non-onboarding) ────────────────────────────────────────────
  if (editing) {
    return (
      <PageShell title="Change store" subtitle="Update your preferred store and ZIP code">
        <form
          className="settings-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!validateZip()) return
            finish()
            setEditing(false)
            setStoreOptions(null) // refetch with new ZIP on return to main view
          }}
        >
          <div className="settings-panel settings-field">
            <label htmlFor="zip2">ZIP code</label>
            <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  id="zip2"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 10001"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value.replace(/\D/g, ''))
                    if (storeOptions) setStoreOptions(null)
                  }}
                />
                {zipError && <span className="field-error">{zipError}</span>}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void fetchStores(zipCode)}
                disabled={zipCode.length !== 5 || loadingStores}
                loading={loadingStores}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="settings-panel settings-field">
            <label>
              {storeOptions ? `Stores near ${zipCode} — sorted by best value` : 'Preferred store'}
            </label>
            {storeOptions || loadingStores || storesError
              ? <StoreRankSection zip={zipCode} />
              : <FallbackStoreGrid />
            }
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
            <Button type="submit" size="lg" fullWidth loading={saving} disabled={!storeId}>
              Save
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </PageShell>
    )
  }

  // ── Main settings view ────────────────────────────────────────────────────
  return (
    <div className="settings-page-wrap">
      <h1 className="settings-page-title">Settings</h1>

      {/* Store comparison card */}
      <div className="settings-section-card">
        <div className="settings-stores-header">
          <div>
            <span className="settings-section-label" style={{ padding: 0 }}>Stores near you</span>
            <span className="settings-stores-zip">ZIP {prefs.zipCode}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
            {gasPrice !== null && (
              <span className="settings-stores-gas">${gasPrice.toFixed(2)}/gal · 28 mpg</span>
            )}
            <button
              type="button"
              className="settings-edit-link"
              onClick={() => setEditing(true)}
            >
              Change ZIP
            </button>
          </div>
        </div>

        {loadingStores ? (
          <div className="store-loading" style={{ padding: 'var(--s-4)' }}>
            <Spinner size="sm" /> Finding stores near {prefs.zipCode}…
          </div>
        ) : storesError ? (
          <p className="field-error" style={{ padding: 'var(--s-4)' }}>{storesError}</p>
        ) : storeOptions ? (
          <ul className="settings-store-list">
            {storeOptions.map((opt, i) => {
              const isCurrent = opt.id === prefs.storeId
              const isBest = i === 0
              return (
                <li key={opt.id} className={`settings-store-row${isCurrent ? ' current' : ''}`}>
                  <div className="settings-store-row__left">
                    <div className="settings-store-row__badges">
                      {isBest && <span className="settings-store-badge best">Best value</span>}
                      {isCurrent && <span className="settings-store-badge current">Your store</span>}
                    </div>
                    <span className="settings-store-row__name">{opt.name}</span>
                    <span className="settings-store-row__meta">
                      {opt.distance} mi · ${opt.travelCost.toFixed(2)} gas (round trip)
                    </span>
                  </div>
                  <div className="settings-store-row__right">
                    {isCurrent ? (
                      <IconCheck size={18} className="settings-store-row__check" />
                    ) : (
                      <button
                        type="button"
                        className="settings-store-switch press"
                        onClick={() => switchStore(opt.id)}
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div style={{ padding: 'var(--s-4)' }}>
            <button
              type="button"
              className="settings-edit-link"
              onClick={() => prefs.zipCode ? void fetchStores(prefs.zipCode) : setEditing(true)}
            >
              {prefs.zipCode ? 'Load stores near ' + prefs.zipCode : 'Set your ZIP to see nearby stores'}
            </button>
          </div>
        )}
      </div>

      <div className="settings-section-card">
        <span className="settings-section-label">List preferences</span>
        <div className="settings-section-row">
          <div>
            <div className="settings-section-row__label">Default to cheapest match</div>
            <div className="settings-section-row__sub">Always pick the lowest-priced product match</div>
          </div>
          <Toggle
            checked={cheapestMatch}
            onChange={(v) => {
              setCheapestMatch(v)
              onSave({ ...prefs, cheapestMatch: v, flagLowConfidence })
            }}
          />
        </div>
        <div className="settings-section-row">
          <div>
            <div className="settings-section-row__label">Flag low-confidence items</div>
            <div className="settings-section-row__sub">Show a warning when ingredient matching is uncertain</div>
          </div>
          <Toggle
            checked={flagLowConfidence}
            onChange={(v) => {
              setFlagLowConfidence(v)
              onSave({ ...prefs, cheapestMatch, flagLowConfidence: v })
            }}
          />
        </div>
      </div>

      <p className="settings-page-footer">
        Distances are estimates · gas at ${gasPrice?.toFixed(2) ?? '3.45'}/gal · not affiliated with any retailer
      </p>
    </div>
  )
}
