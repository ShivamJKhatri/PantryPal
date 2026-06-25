import { useState } from 'react'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'
import PageShell from '../components/PageShell.tsx'
import Button from '../components/Button.tsx'
import { IconCheck } from '../components/icons.tsx'

export const STORE_OPTIONS = [
  { id: 'store-kroger', name: 'Kroger' },
  { id: 'store-walmart', name: 'Walmart' },
  { id: 'store-target', name: 'Target' },
  { id: 'store-wholefoods', name: 'Whole Foods' },
  { id: 'store-safeway', name: 'Safeway' },
  { id: 'store-publix', name: 'Publix' },
]

interface Props {
  prefs: UserPrefs
  onSave: (prefs: UserPrefs) => void
  isOnboarding?: boolean
}

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

export default function SettingsPage({ prefs, onSave, isOnboarding }: Props) {
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState(prefs.storeId || 'store-kroger')
  const [zipCode, setZipCode] = useState(prefs.zipCode || '')
  const [zipError, setZipError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [cheapestMatch, setCheapestMatch] = useState(prefs.cheapestMatch ?? true)
  const [flagLowConfidence, setFlagLowConfidence] = useState(prefs.flagLowConfidence ?? true)

  const store = STORE_OPTIONS.find((s) => s.id === storeId) ?? STORE_OPTIONS[0]

  function finish() {
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setZipError('Enter a valid 5-digit ZIP code')
      return
    }
    setZipError('')
    setSaving(true)
    onSave({ storeId, storeName: store.name, zipCode: zipCode.trim(), cheapestMatch, flagLowConfidence })
  }

  // Onboarding flow — unchanged
  if (isOnboarding) {
    return (
      <PageShell
        title="Welcome to PantryPal"
        subtitle="Set your store and ZIP for price estimates"
      >
        <div className="settings-steps" aria-hidden>
          <span className={`settings-step-dot${step >= 1 ? ' settings-step-dot--active' : ''}`} />
          <span className={`settings-step-dot${step >= 2 ? ' settings-step-dot--active' : ''}`} />
        </div>

        <form
          className="settings-form"
          onSubmit={(e) => { e.preventDefault(); if (step === 1) { setStep(2); return; } finish() }}
        >
          {step === 1 && (
            <div className="settings-panel settings-field">
              <label>Preferred store</label>
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
            </div>
          )}

          {step === 2 && (
            <div className="settings-panel settings-field">
              <label htmlFor="zip">ZIP code</label>
              <input
                id="zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 10001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
              />
              {zipError && <span className="field-error">{zipError}</span>}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth loading={saving}>
            {step === 1 ? 'Continue' : 'Get started'}
          </Button>
        </form>
      </PageShell>
    )
  }

  // Edit store — shown when user clicks "Change store or ZIP code"
  if (editing) {
    return (
      <PageShell title="Change store" subtitle="Update your preferred store and ZIP code">
        <form
          className="settings-form"
          onSubmit={(e) => { e.preventDefault(); finish(); setEditing(false) }}
        >
          <div className="settings-panel settings-field">
            <label>Preferred store</label>
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
          </div>
          <div className="settings-panel settings-field">
            <label htmlFor="zip2">ZIP code</label>
            <input
              id="zip2"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="e.g. 10001"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            />
            {zipError && <span className="field-error">{zipError}</span>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
            <Button type="submit" size="lg" fullWidth loading={saving}>Save</Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      </PageShell>
    )
  }

  // Main settings page — section card design
  return (
    <div className="settings-page-wrap">
      <h1 className="settings-page-title">Settings</h1>

      <div className="settings-section-card">
        <span className="settings-section-label">Your store</span>
        <div className="settings-section-row">
          <div className="settings-section-row__label">Preferred store</div>
          <div className="settings-section-row__value">
            <span className="settings-section-row__dot" />
            {prefs.storeName || '—'}
          </div>
        </div>
        <div className="settings-section-row">
          <div className="settings-section-row__label">ZIP code</div>
          <div className="settings-section-row__value">{prefs.zipCode || '—'}</div>
        </div>
        <div className="settings-section-row">
          <div className="settings-section-row__label">Pricing mode</div>
          <span className="settings-section-row__chip">Live API pricing</span>
        </div>
        <div className="settings-section-row">
          <div />
          <button type="button" className="settings-edit-link" onClick={() => setEditing(true)}>
            Change store or ZIP code
          </button>
        </div>
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
        Prices are estimates sourced from store APIs · not affiliated with any retailer
      </p>
    </div>
  )
}
