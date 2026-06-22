import { useState } from 'react'
import type { UserPrefs } from '../hooks/useUserPrefs.ts'

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
  const [storeId, setStoreId] = useState(prefs.storeId || 'store-kroger')
  const [zipCode, setZipCode] = useState(prefs.zipCode || '')
  const [zipError, setZipError] = useState('')

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setZipError('Enter a valid 5-digit ZIP code')
      return
    }
    setZipError('')
    const store = STORE_OPTIONS.find((s) => s.id === storeId)!
    onSave({ storeId, storeName: store.name, zipCode: zipCode.trim() })
  }

  return (
    <div className="settings-page">
      <h1>{isOnboarding ? 'Welcome to PantryPal!' : 'Settings'}</h1>
      {isOnboarding && (
        <p className="subtitle">Set your store and ZIP code to get accurate prices.</p>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-field">
          <label>Preferred Store</label>
          <div className="store-grid">
            {STORE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`store-btn${storeId === s.id ? ' selected' : ''}`}
                onClick={() => setStoreId(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="zip">ZIP Code</label>
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

        <button type="submit" className="save-btn">
          {isOnboarding ? 'Get Started' : 'Save'}
        </button>
      </form>
    </div>
  )
}
