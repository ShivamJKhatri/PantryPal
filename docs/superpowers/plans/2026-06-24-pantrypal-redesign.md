# PantryPal Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle PantryPal to match the target screenshots: warm cream background, dark forest green accents, Playfair Display serif headings, pill-shaped top nav on desktop with store chip, two-column hero on CapturePage, sidebar cart on ShoppingListPage detail, toggle-based PantryPage, and section-card SettingsPage.

**Architecture:** CSS-only visual layer changes. All business logic, hooks, and API layer untouched. Each page handles its own layout width. New CSS classes appended to `style.css`; no new CSS files created.

**Tech Stack:** React 19, Vite, pure CSS custom properties (no Tailwind/shadcn). Google Fonts — Playfair Display added alongside existing DM Sans.


- No new npm dependencies
- No changes to `src/hooks/` (except `useUserPrefs.ts` which adds two fields), `src/lib/`, `src/services/`, `src/types/`
- `prefers-reduced-motion` is already handled in `tokens.css` — do not break it
- All SVG icons remain from `src/components/icons.tsx` — no emoji icons
- `cursor: pointer` on all interactive elements
- Hover transitions 150–300ms using existing easing tokens
- Responsive breakpoints: 768px (desktop nav), 900px (list sidebar)

---

### Task 1: Design Tokens + Playfair Display Font

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `index.html`

**Interfaces:**
- Produces: `--bg #F0EDE6`, `--accent #2D5016`, `--font-serif`, `--shadow-card`, `--fs-3xl`, `--content-wide` — all referenced by subsequent tasks

- [ ] **Step 1: Replace entire `src/styles/tokens.css`**

```css
:root {
  --bg: #F0EDE6;
  --bg-elevated: #F7F4EF;
  --surface: #FFFFFF;
  --surface-2: #F5F2EB;
  --overlay: rgba(28, 25, 23, 0.04);

  --text: #1A1A14;
  --text-muted: #6B6254;
  --text-subtle: #A09080;
  --text-inverse: #F7F4EF;

  --accent: #2D5016;
  --accent-hover: #234010;
  --accent-soft: #E6EEE0;
  --accent-ring: rgba(45, 80, 22, 0.18);

  --danger: #B91C1C;
  --danger-soft: #FEF2F2;
  --warning: #B45309;
  --warning-soft: #FEF3C7;
  --success: #15803D;

  --border: #E4E0D8;
  --border-strong: #CEC9BF;

  --r-xs: 6px;
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --r-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(26, 26, 20, 0.04);
  --shadow-sm: 0 1px 2px rgba(26, 26, 20, 0.06), 0 1px 3px rgba(26, 26, 20, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(26, 26, 20, 0.08), 0 2px 4px -2px rgba(26, 26, 20, 0.04);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-glass: 0 -1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 24px rgba(26, 26, 20, 0.08);

  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-8: 32px;
  --s-10: 40px;

  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;

  --fs-xs: 0.75rem;
  --fs-sm: 0.875rem;
  --fs-base: 1rem;
  --fs-lg: 1.125rem;
  --fs-xl: 1.375rem;
  --fs-2xl: 1.75rem;
  --fs-3xl: 2.25rem;

  --ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --dur-fast: 160ms;
  --dur-base: 220ms;
  --dur-slow: 320ms;

  --nav-height: 56px;
  --bottom-nav-height: 64px;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --content-max: 640px;
  --content-wide: 1100px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 1ms;
    --dur-base: 1ms;
    --dur-slow: 1ms;
  }
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

- [ ] **Step 2: Update `index.html` — add Playfair Display and update theme color**

Find:
```html
    <meta name="theme-color" content="#FAFAF7" />
```
Replace with:
```html
    <meta name="theme-color" content="#F0EDE6" />
```

Find:
```html
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
```
Replace with:
```html
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" />
```

- [ ] **Step 3: Start dev server and verify**

Run `npm run dev`. Confirm: background is warm cream `#F0EDE6`, accent green is darker forest green `#2D5016`, no layout regressions.

---

### Task 2: Base styles — serif h1, card shadow, pill buttons, body gradient

**Files:**
- Modify: `src/style.css`

**Interfaces:**
- Consumes: `--font-serif`, `--shadow-card`, `--accent-hover`, `--r-pill` from Task 1
- Produces: Serif h1, updated card shadow, pill-shaped primary button with hover lift, updated body gradient

- [ ] **Step 1: Update `h1` block in `src/style.css`**

Find:
```css
h1 {
  font-size: var(--fs-2xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
```
Replace with:
```css
h1 {
  font-family: var(--font-serif);
  font-size: var(--fs-2xl);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
```

- [ ] **Step 2: Update body background gradient**

Find:
```css
  background-image:
    radial-gradient(at 0% 0%, rgba(232, 240, 235, 0.45) 0, transparent 50%),
    radial-gradient(at 100% 100%, rgba(245, 244, 241, 0.6) 0, transparent 50%);
```
Replace with:
```css
  background-image:
    radial-gradient(at 0% 0%, rgba(230, 238, 224, 0.5) 0, transparent 50%),
    radial-gradient(at 100% 100%, rgba(247, 244, 239, 0.7) 0, transparent 50%);
```

- [ ] **Step 3: Update `.card` shadow**

Find:
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
```
Replace with:
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
}
```

- [ ] **Step 4: Update `.btn` transition and `.btn--primary` to pill shape with hover lift**

Find:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  border-radius: var(--r-md);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  transition: background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
}
```
Replace with:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  border-radius: var(--r-md);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  transition: background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast);
}
```

Find:
```css
.btn--primary { background: var(--accent); color: var(--text-inverse); }
.btn--primary:hover:not(:disabled) { background: var(--accent-hover); }
```
Replace with:
```css
.btn--primary { background: var(--accent); color: var(--text-inverse); border-radius: var(--r-pill); }
.btn--primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(45,80,22,0.22); }
```

- [ ] **Step 5: Verify**

Confirm: `h1` on any page uses Playfair Display serif. Cards have subtle elevated shadow. Primary buttons are pill-shaped with hover lift. Background gradient is warm cream.

---

### Task 3: Navigation — pill-group desktop redesign + store chip

**Files:**
- Modify: `src/style.css` (bottom-nav section + .main block)
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `page: Page`, `onNavigate`, `hasList`, `stapleCount` (existing) + new `storeName?: string`, `zipCode?: string`
- Produces: Desktop — 3-column nav grid: logo left, centered pill-group, store chip right. Mobile — unchanged bottom bar. `main--wide` class for capture/list pages.

- [ ] **Step 1: Replace `src/components/BottomNav.tsx`**

```tsx
import type { Page } from '../App.tsx'
import { IconHome, IconList, IconPantry, IconSettings } from './icons.tsx'

type NavProps = {
  page: Page
  onNavigate: (p: Page) => void
  hasList: boolean
  stapleCount: number
  storeName?: string
  zipCode?: string
}

const TABS: { id: Page; label: string; Icon: typeof IconHome }[] = [
  { id: 'capture', label: 'Add', Icon: IconHome },
  { id: 'list', label: 'List', Icon: IconList },
  { id: 'pantry', label: 'Pantry', Icon: IconPantry },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

export default function BottomNav({ page, onNavigate, hasList, stapleCount, storeName, zipCode }: NavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <span className="bottom-nav__brand">
        <span className="bottom-nav__brand-p">P</span>
        PantryPal
      </span>
      <div className="bottom-nav__tabs-wrap">
        <div className="bottom-nav__tabs">
          {TABS.map(({ id, label, Icon }) => {
            const active = page === id
            const badge =
              id === 'list' && hasList ? '•'
              : id === 'pantry' && stapleCount > 0 ? String(stapleCount)
              : null
            return (
              <button
                key={id}
                type="button"
                className="bottom-nav__tab press"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(id)}
              >
                <span className="bottom-nav__icon-wrap">
                  <Icon size={20} />
                  {badge && <span className="bottom-nav__badge">{badge}</span>}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
      {storeName && zipCode && (
        <div className="bottom-nav__store" aria-hidden="true">
          <span className="bottom-nav__store-dot" />
          <span className="bottom-nav__store-text">{storeName} {zipCode}</span>
          <span className="bottom-nav__store-avatar">{storeName[0]}</span>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Update `src/App.tsx` — pass prefs + add `main--wide` class**

Find the BottomNav usage:
```tsx
        <BottomNav
          page={page}
          onNavigate={(next) => {
            if (next === 'list') navigate('list', { listView: { kind: 'recipes' } })
            else navigate(next)
          }}
          hasList={hasRecipes}
          stapleCount={staples.length}
        />
```
Replace with:
```tsx
        <BottomNav
          page={page}
          onNavigate={(next) => {
            if (next === 'list') navigate('list', { listView: { kind: 'recipes' } })
            else navigate(next)
          }}
          hasList={hasRecipes}
          stapleCount={staples.length}
          storeName={prefs.storeName}
          zipCode={prefs.zipCode}
        />
```

Find:
```tsx
      <main className={`main${isOnboarding ? ' main--onboarding' : ''}`} key={page}>
```
Replace with:
```tsx
      <main className={`main${isOnboarding ? ' main--onboarding' : ''}${page === 'capture' || page === 'list' ? ' main--wide' : ''}`} key={page}>
```

- [ ] **Step 3: Replace the entire `/* ── Bottom nav ── */` section in `src/style.css`**

Find the section starting with `/* ── Bottom nav ──` and ending just before `/* ── Buttons ──`. Replace it entirely with:

```css
/* ── Bottom nav ──────────────────────────────────────────────────────────── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  height: calc(var(--bottom-nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: rgba(240, 237, 230, 0.88);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-top: 1px solid var(--border);
}

.bottom-nav__brand {
  display: none;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--text);
  white-space: nowrap;
}

.bottom-nav__brand-p {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--accent);
  color: var(--text-inverse);
  border-radius: var(--r-sm);
  font-size: var(--fs-sm);
  font-weight: 700;
}

.bottom-nav__tabs-wrap {
  display: flex;
  flex: 1;
}

.bottom-nav__tabs {
  display: flex;
  flex: 1;
}

.bottom-nav__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: color var(--dur-fast);
}

.bottom-nav__tab[aria-current="page"] { color: var(--accent); }
.bottom-nav__tab[aria-current="page"] svg { transform: translateY(-1px) scale(1.06); }
.bottom-nav__tab svg { transition: transform var(--dur-fast) var(--ease-spring); }

.bottom-nav__icon-wrap { position: relative; display: grid; place-items: center; }

.bottom-nav__badge {
  position: absolute;
  top: -4px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--r-pill);
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 9px;
  font-weight: 600;
  display: grid;
  place-items: center;
  animation: pop 280ms var(--ease-spring);
}

.bottom-nav__store { display: none; }

@media (min-width: 768px) {
  .bottom-nav {
    position: sticky;
    top: 0;
    bottom: auto;
    height: var(--nav-height);
    padding-bottom: 0;
    border-top: none;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0 var(--s-6);
    gap: var(--s-6);
    background: rgba(240, 237, 230, 0.92);
  }

  .bottom-nav__brand { display: flex; }

  .bottom-nav__tabs-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bottom-nav__tabs {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: var(--r-pill);
    background: var(--surface);
    box-shadow: var(--shadow-xs);
  }

  .bottom-nav__tab {
    flex: 0 0 auto;
    flex-direction: row;
    gap: var(--s-2);
    padding: 6px 16px;
    font-size: var(--fs-sm);
    border-radius: var(--r-pill);
    transition: background var(--dur-fast), color var(--dur-fast);
  }

  .bottom-nav__tab[aria-current="page"] {
    background: var(--text);
    color: var(--text-inverse);
  }

  .bottom-nav__tab[aria-current="page"] svg { transform: none; }

  .bottom-nav__store {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--r-pill);
    font-size: var(--fs-xs);
    font-weight: 500;
    color: var(--text-muted);
    background: var(--surface);
    white-space: nowrap;
  }

  .bottom-nav__store-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success);
    flex-shrink: 0;
  }

  .bottom-nav__store-text { flex: 1; }

  .bottom-nav__store-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--text-inverse);
    font-size: 11px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .main { padding-bottom: var(--s-8); }

  .main--wide {
    max-width: var(--content-wide);
    margin: 0 auto;
  }
}
```

- [ ] **Step 4: Verify nav**

Desktop ≥768px: see `P PantryPal` logo left, centered pill-group tab bar, store chip right. Active tab is dark filled pill. Mobile: bottom bar with icon+label tabs, green active color. No layout shift.

---

### Task 4: CapturePage hero redesign

**Files:**
- Modify: `src/style.css` (append capture-hero section)
- Modify: `src/pages/CapturePage.tsx`

**Interfaces:**
- Consumes: `--font-serif`, `--content-wide`, `--accent`, all existing CapturePage props unchanged (`prefs`, `onListReady`, `onGoToSettings`)
- Produces: Two-column hero layout on desktop. Serif heading with italic green accent. Numbered features list. "Try a sample" link auto-submits form.

- [ ] **Step 1: Append capture-hero CSS to end of `src/style.css`**

```css
/* ── Capture hero ────────────────────────────────────────────────────────── */
.capture-layout {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  padding-top: var(--s-4);
}

.capture-hero { max-width: 540px; }

.capture-hero__heading {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: var(--s-4) 0 var(--s-5);
}

.capture-hero__accent {
  font-style: italic;
  color: var(--accent);
}

.capture-hero__sub {
  font-size: var(--fs-base);
  color: var(--text-muted);
  line-height: 1.65;
  max-width: 46ch;
  margin-bottom: var(--s-6);
}

.capture-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  counter-reset: feature;
}

.capture-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  counter-increment: feature;
}

.capture-features li::before {
  content: counter(feature);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  margin-top: 1px;
  flex-shrink: 0;
}

.capture-features strong { color: var(--text); font-weight: 600; }

.capture-card-col {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.capture-url-label {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-subtle);
  display: block;
  margin-bottom: var(--s-2);
}

.capture-sample-link {
  display: block;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  margin-top: calc(-1 * var(--s-2));
  margin-bottom: var(--s-4);
  transition: color var(--dur-fast);
}
.capture-sample-link:hover { color: var(--accent); }
.capture-sample-link strong { color: var(--accent); font-weight: 600; }

@media (min-width: 768px) {
  .capture-layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 64px;
    align-items: start;
    padding-top: var(--s-10);
  }

  .capture-hero { max-width: none; }

  .capture-card-col {
    position: sticky;
    top: calc(var(--nav-height) + var(--s-6));
  }
}
```

- [ ] **Step 2: Replace entire `src/pages/CapturePage.tsx`**

```tsx
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
const SAMPLE_URL = 'https://www.budgetbytes.com/creamy-tuscan-chicken-pasta/'

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
    <div className="capture-layout anim-fade-up">
      {/* Hero column */}
      <div className="capture-hero">
        <button
          type="button"
          className={`store-chip${hasPrefs ? '' : ' store-chip--warn'}`}
          onClick={onGoToSettings}
        >
          {hasPrefs
            ? `Shopping at ${prefs.storeName} · ${prefs.zipCode}`
            : 'Set store for estimates'}
          <span aria-hidden> ›</span>
        </button>

        <h1 className="capture-hero__heading">
          From recipe to a{' '}
          <em className="capture-hero__accent">priced cart</em>{' '}
          in under ten seconds.
        </h1>

        <p className="capture-hero__sub">
          Paste any recipe link or drop in a screenshot.
          PantryPal reads it, matches every ingredient to a real
          product at your store, and totals the trip — before you
          leave the couch.
        </p>

        <ol className="capture-features">
          <li><strong>Reads links</strong> and screenshots from video, books or paper</li>
          <li><strong>Matches real products,</strong> cheapest reasonable pick first</li>
          <li><strong>Skips the salt & oil</strong> already in your pantry</li>
        </ol>
      </div>

      {/* Input card column */}
      <div className="capture-card-col">
        <Card>
          {loading ? (
            <div className="loading-card">
              <Spinner size="lg" />
              <p className="loading-card__label">{LOADING_STEPS[loadingStep]}</p>
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
                  <IconLink size={16} /> Paste a link
                </button>
                <button
                  type="button"
                  className="tabs__btn press"
                  aria-selected={tab === 'photo'}
                  onClick={() => setTab('photo')}
                >
                  <IconCamera size={16} /> Upload a photo
                </button>
              </div>

              {tab === 'url' ? (
                <form onSubmit={(e) => { e.preventDefault(); void submitUrl(url) }}>
                  <label className="capture-url-label" htmlFor="recipe-url">Recipe URL</label>
                  <input
                    id="recipe-url"
                    ref={urlRef}
                    type="url"
                    className="url-input"
                    placeholder="https://www.budgetbytes.com/…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="capture-sample-link"
                    onClick={() => { setUrl(SAMPLE_URL); void submitUrl(SAMPLE_URL) }}
                  >
                    Try a sample → <strong>Creamy Tuscan Chicken Pasta</strong>
                  </button>
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

        <p className="capture-hint">Works with budgetbytes · simplyrecipes · NYT Cooking · recipetineats</p>

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
```

- [ ] **Step 3: Verify CapturePage**

Desktop ≥768px: hero text left, input card sticky right. Serif heading with italic green "priced cart". Numbered list with circled numbers. "Try a sample" link fires submitUrl. Mobile: stacked vertically. Error card appears below the input card.

---

### Task 5: ShoppingListPage — sidebar cart on detail view

**Files:**
- Modify: `src/style.css` (append list-detail-layout section)
- Modify: `src/pages/ShoppingListPage.tsx`

**Interfaces:**
- Consumes: `selectedRecipe`, `staples`, `cartRecipeIds`, `onAddRecipeToCart`, `onRemoveRecipeFromCart`, `onNewRecipe`, `storeDisplayName()`, `calcActiveTotal()`, `applyPantryExclusions()`, `CountUp`, `IconCheck`, `IconExternal`, `showToast` — all already imported
- Produces: Detail view has two-column layout (≥900px): main panel left, cart sidebar right. Pantry savings banner. "Share list" uses Web Share API with clipboard fallback.

- [ ] **Step 1: Append list-detail CSS to end of `src/style.css`**

```css
/* ── List detail layout ──────────────────────────────────────────────────── */
.list-detail-layout {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
}

.list-detail-label {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
  margin-bottom: var(--s-2);
}

.list-detail-title {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: var(--s-3);
}

.list-detail-new-recipe {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  background: var(--surface);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color var(--dur-fast), color var(--dur-fast);
  white-space: nowrap;
}
.list-detail-new-recipe:hover { border-color: var(--border-strong); color: var(--text); }

.pantry-savings-banner {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--accent-soft);
  border: 1px solid rgba(45,80,22,0.1);
  border-radius: var(--r-md);
  margin-bottom: var(--s-4);
  font-size: var(--fs-sm);
}

.pantry-savings-banner__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-inverse);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.pantry-savings-banner__body { flex: 1; min-width: 0; }
.pantry-savings-banner__title { font-weight: 600; color: var(--accent-hover); }
.pantry-savings-banner__sub { color: var(--text-muted); font-size: var(--fs-xs); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pantry-savings-banner__amount { font-weight: 700; color: var(--accent); white-space: nowrap; }

/* Sidebar */
.list-sidebar { display: flex; flex-direction: column; gap: var(--s-3); }

.list-sidebar-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  padding: var(--s-5);
}

.list-sidebar-title {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--s-4);
}

.list-sidebar-store {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  font-size: var(--fs-xs);
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg);
  margin-bottom: var(--s-4);
}

.list-sidebar-store-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
}

.list-sidebar-rows {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-bottom: var(--s-1);
}

.list-sidebar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.list-sidebar-total {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: var(--s-3);
  margin-top: var(--s-2);
  border-top: 1px solid var(--border);
}

.list-sidebar-total__label { font-size: var(--fs-sm); font-weight: 600; color: var(--text); }
.list-sidebar-total__amount {
  font-family: var(--font-serif);
  font-size: var(--fs-3xl);
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}
.list-sidebar-total__note { font-size: var(--fs-xs); color: var(--text-subtle); }

.list-sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-top: var(--s-4);
}

.list-sidebar-footer {
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  text-align: center;
  margin-top: var(--s-3);
  line-height: 1.5;
}

@media (min-width: 900px) {
  .list-detail-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--s-8);
    align-items: start;
  }

  .list-sidebar {
    position: sticky;
    top: calc(var(--nav-height) + var(--s-6));
  }
}
```

- [ ] **Step 2: Replace the `if (view.kind === 'detail' && selectedRecipe)` block in `src/pages/ShoppingListPage.tsx`**

Find the block starting with `  if (view.kind === 'detail' && selectedRecipe) {` and replace it entirely (up to and including its closing `}`):

```tsx
  if (view.kind === 'detail' && selectedRecipe) {
    const inCart = cartRecipeIds.includes(selectedRecipe.id)
    const adjustedItems = applyPantryExclusions(selectedRecipe.items, staples)
    const activeItems = adjustedItems.filter((i) => !i.excluded && !i.notFound)
    const excludedItems = adjustedItems.filter((i) => i.excluded)
    const activeTotal = calcActiveTotal(adjustedItems)
    const savedTotal = excludedItems.reduce((sum, i) => sum + i.price, 0)
    const storeName = storeDisplayName(selectedRecipe.storeId)

    function handleShareList() {
      const text = `${selectedRecipe.recipeTitle} — ${activeItems.length} items, $${activeTotal.toFixed(2)} est.`
      if (navigator.share) {
        void navigator.share({ title: selectedRecipe.recipeTitle, text })
      } else {
        void navigator.clipboard.writeText(text)
        showToast('List copied to clipboard', 'success')
      }
    }

    return (
      <PageShell>
        <div className="list-detail-layout">
          {/* Main panel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-2)' }}>
              <p className="list-detail-label">
                YOUR SHOPPING LIST
                {selectedRecipe.sourceUrl && (
                  <> · <a className="source-link" href={selectedRecipe.sourceUrl} target="_blank" rel="noreferrer">
                    {(() => { try { return new URL(selectedRecipe.sourceUrl).hostname.replace('www.', '') } catch { return '' } })()}
                  </a></>
                )}
              </p>
              <button type="button" className="list-detail-new-recipe press" onClick={onNewRecipe}>
                New recipe
              </button>
            </div>

            <h1 className="list-detail-title">{selectedRecipe.recipeTitle}</h1>

            <div className="list-meta" style={{ marginBottom: 'var(--s-4)' }}>
              <span>{activeItems.length} ingredients</span>
              <span className="list-meta__sep" aria-hidden>·</span>
              <span>{storeName} · {selectedRecipe.zipCode}</span>
              {selectedRecipe.sourceUrl && (
                <>
                  <span className="list-meta__sep" aria-hidden>·</span>
                  <a className="source-link" href={selectedRecipe.sourceUrl} target="_blank" rel="noreferrer">
                    View recipe <IconExternal size={12} />
                  </a>
                </>
              )}
            </div>

            {excludedItems.length > 0 && (
              <div className="pantry-savings-banner">
                <div className="pantry-savings-banner__icon">
                  <IconCheck size={14} />
                </div>
                <div className="pantry-savings-banner__body">
                  <p className="pantry-savings-banner__title">
                    {excludedItems.length} staple{excludedItems.length !== 1 ? 's' : ''} from your pantry, skipped
                  </p>
                  <p className="pantry-savings-banner__sub">
                    {excludedItems.slice(0, 3).map((i) => i.ingredientName).join(' · ')}
                    {excludedItems.length > 3 && ` · +${excludedItems.length - 3} more`}
                  </p>
                </div>
                {savedTotal > 0 && (
                  <span className="pantry-savings-banner__amount">−${savedTotal.toFixed(2)}</span>
                )}
              </div>
            )}

            <ItemList
              items={selectedRecipe.items}
              staples={staples}
              onItemsChange={(items) => onUpdateRecipe(selectedRecipe.id, items)}
              onAddToPantry={onAddToPantry}
              onRemoveFromPantry={onRemoveFromPantry}
            />
          </div>

          {/* Sidebar */}
          <div className="list-sidebar">
            <div className="list-sidebar-card">
              <p className="list-sidebar-title">Your cart</p>

              <div className="list-sidebar-store">
                <span className="list-sidebar-store-dot" />
                {storeName} · {selectedRecipe.zipCode}
              </div>

              <div className="list-sidebar-rows">
                <div className="list-sidebar-row">
                  <span>{activeItems.length} items to buy</span>
                  <span>${activeTotal.toFixed(2)}</span>
                </div>
                {savedTotal > 0 && (
                  <div className="list-sidebar-row">
                    <span>Pantry staples</span>
                    <span style={{ color: 'var(--accent)' }}>−${savedTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="list-sidebar-total">
                <span className="list-sidebar-total__label">Estimated total</span>
                <span className="list-sidebar-total__amount">$<CountUp value={activeTotal} /></span>
                <span className="list-sidebar-total__note">estimate within ±15%</span>
              </div>

              <div className="list-sidebar-actions">
                {inCart ? (
                  <Button
                    variant="secondary"
                    fullWidth
                    size="lg"
                    onClick={() => {
                      onRemoveRecipeFromCart(selectedRecipe.id)
                      showToast('Removed from cart', 'default')
                    }}
                  >
                    Remove from cart
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => {
                      onAddRecipeToCart(selectedRecipe.id)
                      showToast('Added to cart', 'success')
                    }}
                  >
                    Send to {storeName} cart
                  </Button>
                )}
                <Button variant="secondary" fullWidth onClick={handleShareList}>
                  Share list
                </Button>
              </div>

              <p className="list-sidebar-footer">
                Prices pulled live from {storeName}'s API by zip code.
                Tap any match to swap it.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }
```

- [ ] **Step 3: Verify ShoppingListPage detail view**

Open a recipe detail. Desktop ≥900px: main panel left, sidebar right, sidebar is sticky. Pantry savings banner visible when staples overlap. "Send to cart" / "Remove from cart" toggles correctly. "Share list" triggers browser share or copies to clipboard.

---

### Task 6: PantryPage — toggle-based staples

**Files:**
- Modify: `src/style.css` (append toggle + pantry-v2 section)
- Modify: `src/pages/PantryPage.tsx`

**Interfaces:**
- Consumes: `staples: PantryStaple[]`, `onAdd: (label: string) => boolean`, `onRemove: (id: string) => void`
- Produces: Toggle switches replace X buttons. Toggle OFF → `onRemove`. Serif page title. Quick-add chips remain below list.

- [ ] **Step 1: Append toggle + pantry-v2 CSS to end of `src/style.css`**

```css
/* ── Toggle switch ───────────────────────────────────────────────────────── */
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle__track {
  display: block;
  width: 44px;
  height: 26px;
  border-radius: var(--r-pill);
  background: var(--border-strong);
  transition: background var(--dur-base) var(--ease-out-quart);
  cursor: pointer;
}

.toggle__input:checked + .toggle__track { background: var(--accent); }

.toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform var(--dur-base) var(--ease-out-expo);
  pointer-events: none;
}

.toggle__input:checked ~ .toggle__thumb { transform: translateX(18px); }

/* ── Pantry page v2 ──────────────────────────────────────────────────────── */
.pantry-page-wrap {
  max-width: var(--content-max);
  margin: 0 auto;
}

.pantry-page-title {
  font-family: var(--font-serif);
  font-size: var(--fs-3xl);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--s-2);
}

.pantry-page-subtitle {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 46ch;
  margin-bottom: var(--s-8);
}

.pantry-staple-list {
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: var(--s-3);
}

.pantry-staple-row {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-4);
  border-bottom: 1px solid var(--border);
  transition: background var(--dur-fast);
}
.pantry-staple-row:last-child { border-bottom: none; }
.pantry-staple-row:hover { background: var(--bg-elevated); }

.pantry-staple-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
}

.pantry-staple-info { flex: 1; min-width: 0; }

.pantry-staple-name {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text);
}

.pantry-staple-meta {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.pantry-footer-note {
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  text-align: center;
  padding: var(--s-3) 0 var(--s-5);
}
```

- [ ] **Step 2: Replace entire `src/pages/PantryPage.tsx`**

```tsx
import { useRef, useState } from 'react'
import type { PantryStaple } from '../types/models.ts'
import Card from '../components/Card.tsx'
import EmptyState from '../components/EmptyState.tsx'
import Chip from '../components/Chip.tsx'
import { IconJar, IconPlus } from '../components/icons.tsx'
import { showToast } from '../hooks/useToast.ts'
import { useFlip } from '../hooks/useFlip.ts'

const QUICK_ADD = [
  'Salt', 'Pepper', 'Olive oil', 'Garlic', 'Butter',
  'Eggs', 'Onion', 'Flour', 'Sugar', 'Rice',
]

interface Props {
  staples: PantryStaple[]
  onAdd: (label: string) => boolean
  onRemove: (id: string) => void
}

export default function PantryPage({ staples, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const flipRef = useFlip(staples.map((s) => s.id))
  const labelsLower = new Set(staples.map((s) => s.label.toLowerCase()))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const label = input.trim()
    if (!label) return
    if (onAdd(label)) {
      setInput('')
      showToast('Added to pantry', 'success')
    }
  }

  function toggleQuick(label: string) {
    const existing = staples.find((s) => s.label.toLowerCase() === label.toLowerCase())
    if (existing) {
      onRemove(existing.id)
      showToast(`Removed ${label}`, 'default')
    } else if (onAdd(label)) {
      showToast(`Added ${label}`, 'success')
    }
  }

  return (
    <div className="pantry-page-wrap anim-fade-up">
      <h1 className="pantry-page-title">Pantry staples</h1>
      <p className="pantry-page-subtitle">
        Anything you keep on hand is quietly skipped from every list,
        so your totals stay honest. Toggle items off when you run out.
      </p>

      <Card style={{ marginBottom: 'var(--s-5)' }}>
        <form className="add-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Add an item…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="icon-btn press" aria-label="Add staple" disabled={!input.trim()}>
            <IconPlus size={18} />
          </button>
        </form>
      </Card>

      {staples.length === 0 ? (
        <EmptyState
          icon={<IconJar size={28} />}
          title="Mark what you already have"
          description="We'll skip these ingredients on every shopping list you build."
          action={{ label: 'Add your first staple', onClick: () => inputRef.current?.focus() }}
        />
      ) : (
        <>
          <ul className="pantry-staple-list stagger">
            {staples.map((staple, index) => (
              <li
                key={staple.id}
                ref={flipRef(staple.id)}
                className="pantry-staple-row"
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="pantry-staple-dot" />
                <div className="pantry-staple-info">
                  <p className="pantry-staple-name">{staple.label}</p>
                  <p className="pantry-staple-meta">On hand</p>
                </div>
                <label className="toggle" aria-label={`Remove ${staple.label} from pantry`}>
                  <input
                    className="toggle__input"
                    type="checkbox"
                    defaultChecked
                    onChange={() => {
                      onRemove(staple.id)
                      showToast(`Removed ${staple.label}`, 'default')
                    }}
                  />
                  <span className="toggle__track" />
                  <span className="toggle__thumb" />
                </label>
              </li>
            ))}
          </ul>
          <p className="pantry-footer-note">
            Pre-seeded with common staples · {staples.length} currently on hand
          </p>
        </>
      )}

      <p className="pantry-section-title">Quick add</p>
      <div className="chip-grid" style={{ marginBottom: 'var(--s-6)' }}>
        {QUICK_ADD.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={labelsLower.has(label.toLowerCase())}
            onClick={() => toggleQuick(label)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify PantryPage**

Staples render in a white card with toggle switches showing dark green. Toggling off removes item and shows toast. Quick-add chips below still work. Serif "Pantry staples" heading renders correctly.

---

### Task 7: SettingsPage — section cards + preference toggles

**Files:**
- Modify: `src/hooks/useUserPrefs.ts`
- Modify: `src/style.css` (append settings-section-card section)
- Modify: `src/pages/SettingsPage.tsx`

**Interfaces:**
- Consumes: `prefs: UserPrefs` (now with `cheapestMatch: boolean`, `flagLowConfidence: boolean`), `isOnboarding?: boolean`, `onSave: (prefs: UserPrefs) => void`
- Produces: Non-onboarding: two section cards (YOUR STORE, LIST PREFERENCES). Preferences persist immediately on toggle. Onboarding flow unchanged. Edit form accessible via link.

- [ ] **Step 1: Extend UserPrefs in `src/hooks/useUserPrefs.ts`**

Find:
```ts
export type UserPrefs = {
  storeId: string
  storeName: string
  zipCode: string
}

const STORAGE_KEY = 'pantrypal_user_prefs'

const EMPTY_PREFS: UserPrefs = { storeId: '', storeName: '', zipCode: '' }
```
Replace with:
```ts
export type UserPrefs = {
  storeId: string
  storeName: string
  zipCode: string
  cheapestMatch: boolean
  flagLowConfidence: boolean
}

const STORAGE_KEY = 'pantrypal_user_prefs'

const EMPTY_PREFS: UserPrefs = {
  storeId: '',
  storeName: '',
  zipCode: '',
  cheapestMatch: true,
  flagLowConfidence: true,
}
```

- [ ] **Step 2: Append settings section CSS to end of `src/style.css`**

```css
/* ── Settings section cards ──────────────────────────────────────────────── */
.settings-page-wrap {
  max-width: var(--content-max);
  margin: 0 auto;
}

.settings-page-title {
  font-family: var(--font-serif);
  font-size: var(--fs-3xl);
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--s-8);
}

.settings-section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: var(--s-4);
}

.settings-section-label {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
  padding: var(--s-4) var(--s-5) var(--s-2);
}

.settings-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding: var(--s-4) var(--s-5);
  border-top: 1px solid var(--border);
}

.settings-section-row__label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text);
}

.settings-section-row__sub {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.settings-section-row__value {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.settings-section-row__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
}

.settings-section-row__chip {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  background: var(--surface-2);
  font-size: var(--fs-xs);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.settings-edit-link {
  background: none;
  border: none;
  color: var(--accent);
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.settings-edit-link:hover { color: var(--accent-hover); }

.settings-page-footer {
  font-size: var(--fs-xs);
  color: var(--text-subtle);
  text-align: center;
  line-height: 1.6;
  padding: var(--s-6) 0;
}
```

- [ ] **Step 3: Replace entire `src/pages/SettingsPage.tsx`**

```tsx
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

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="settings-section-row">
      <div style={{ flex: 1 }}>
        <p className="settings-section-row__label">{label}</p>
        <p className="settings-section-row__sub">{sub}</p>
      </div>
      <label className="toggle" aria-label={label}>
        <input
          className="toggle__input"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle__track" />
        <span className="toggle__thumb" />
      </label>
    </div>
  )
}

export default function SettingsPage({ prefs, onSave, isOnboarding }: Props) {
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState(prefs.storeId || 'store-kroger')
  const [zipCode, setZipCode] = useState(prefs.zipCode || '')
  const [zipError, setZipError] = useState('')
  const [saving, setSaving] = useState(false)
  const [cheapestMatch, setCheapestMatch] = useState(prefs.cheapestMatch ?? true)
  const [flagLowConfidence, setFlagLowConfidence] = useState(prefs.flagLowConfidence ?? true)
  const [editing, setEditing] = useState(false)

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

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (isOnboarding && step === 1) { setStep(2); return }
    finish()
  }

  // Non-onboarding section card view
  if (!isOnboarding && !editing) {
    return (
      <div className="settings-page-wrap anim-fade-up">
        <h1 className="settings-page-title">Settings</h1>

        <div className="settings-section-card">
          <p className="settings-section-label">Your Store</p>
          <div className="settings-section-row">
            <span className="settings-section-row__label">Preferred store</span>
            <span className="settings-section-row__value">
              <span className="settings-section-row__dot" />
              {prefs.storeName}
            </span>
          </div>
          <div className="settings-section-row">
            <span className="settings-section-row__label">Zip code</span>
            <span className="settings-section-row__value">{prefs.zipCode}</span>
          </div>
          <div className="settings-section-row">
            <span className="settings-section-row__label">Pricing mode</span>
            <span className="settings-section-row__chip">Live API pricing</span>
          </div>
        </div>

        <div className="settings-section-card">
          <p className="settings-section-label">List Preferences</p>
          <ToggleRow
            label="Default to cheapest match"
            sub="Auto-pick the lowest reasonable SKU"
            checked={cheapestMatch}
            onChange={(v) => {
              setCheapestMatch(v)
              onSave({ ...prefs, cheapestMatch: v })
            }}
          />
          <ToggleRow
            label="Flag low-confidence items"
            sub="Show a marker when a match is uncertain"
            checked={flagLowConfidence}
            onChange={(v) => {
              setFlagLowConfidence(v)
              onSave({ ...prefs, flagLowConfidence: v })
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-2)' }}>
          <button type="button" className="settings-edit-link" onClick={() => setEditing(true)}>
            Change store or zip code
          </button>
        </div>

        <p className="settings-page-footer">
          PantryPal never scrapes protected content — links read public recipe
          metadata, and screenshots process images you provide.
        </p>
      </div>
    )
  }

  // Onboarding or edit form
  return (
    <PageShell
      title={isOnboarding ? 'Welcome to PantryPal' : 'Change store'}
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

        <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
          {!isOnboarding && (
            <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => setEditing(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="lg" fullWidth loading={saving}>
            {isOnboarding ? (step === 1 ? 'Continue' : 'Get started') : 'Save'}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}
```

- [ ] **Step 4: Verify SettingsPage**

Non-onboarding: two section cards render. List Preferences toggles work and persist immediately. "Change store or zip code" link opens the edit form. "Cancel" returns to section card view. Onboarding two-step flow unchanged.

---

## Self-Review Checklist

- [x] **Spec coverage:** All sections covered — tokens (T1), nav (T3), CapturePage (T4), ShoppingListPage (T5), PantryPage (T6), SettingsPage (T7), base typography (T2)
- [x] **Placeholders:** None — all steps have complete code
- [x] **Type consistency:** `UserPrefs.cheapestMatch` and `flagLowConfidence` defined in T7 Step 1, consumed in T7 Step 3. `storeName`/`zipCode` added to BottomNav props in T3 Step 1, passed in T3 Step 2.
- [x] **No new deps:** Pure CSS + existing React — confirmed
- [x] **`prefers-reduced-motion`:** Handled by existing tokens.css block, preserved
