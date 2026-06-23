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

export default function SettingsPage({ prefs, onSave, isOnboarding }: Props) {
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState(prefs.storeId || 'store-kroger')
  const [zipCode, setZipCode] = useState(prefs.zipCode || '')
  const [zipError, setZipError] = useState('')
  const [saving, setSaving] = useState(false)

  const store = STORE_OPTIONS.find((s) => s.id === storeId)!

  function finish() {
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setZipError('Enter a valid 5-digit ZIP code')
      return
    }
    setZipError('')
    setSaving(true)
    onSave({ storeId, storeName: store.name, zipCode: zipCode.trim() })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (isOnboarding && step === 1) {
      setStep(2)
      return
    }
    finish()
  }

  return (
    <PageShell
      title={isOnboarding ? 'Welcome to PantryPal' : 'Settings'}
      subtitle={
        isOnboarding
          ? 'Set your store and ZIP for price estimates'
          : 'Update your preferred store and location'
      }
    >
      {isOnboarding && (
        <div className="settings-steps" aria-hidden>
          <span className={`settings-step-dot${step >= 1 ? ' settings-step-dot--active' : ''}`} />
          <span className={`settings-step-dot${step >= 2 ? ' settings-step-dot--active' : ''}`} />
        </div>
      )}

      {!isOnboarding && prefs.storeName && prefs.zipCode && (
        <div className="settings-summary">
          Currently shopping at <strong>{prefs.storeName}</strong> near <strong>{prefs.zipCode}</strong>
        </div>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        {(!isOnboarding || step === 1) && (
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

        {(!isOnboarding || step === 2) && (
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
          {isOnboarding ? (step === 1 ? 'Continue' : 'Get started') : 'Save'}
        </Button>
      </form>
    </PageShell>
  )
}
