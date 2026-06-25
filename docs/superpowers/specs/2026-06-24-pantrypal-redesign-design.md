# PantryPal Frontend Redesign — Design Spec

**Date:** 2026-06-24  
**Status:** Approved  
**Approach:** Full visual redesign (Approach B) — update design tokens + fonts + page layouts to match target screenshots

---

## Goals

Restyle the existing PantryPal app to match the provided screenshots:
- Warm cream background, dark forest green accents, serif headings
- Two-column hero on CapturePage, sidebar cart on ShoppingListPage
- Pill-shaped top nav on desktop, existing bottom nav on mobile
- Smooth entrance animations and micro-interactions throughout
- All existing features preserved; only visual layer changes

---

## Design System

### Colors (update `src/styles/tokens.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F0EDE6` | Page background (warm cream) |
| `--bg-elevated` | `#F7F4EF` | Slightly elevated surface |
| `--surface` | `#FFFFFF` | Cards, modals |
| `--surface-2` | `#F5F2EB` | Input backgrounds, secondary cards |
| `--text` | `#1A1A14` | Primary text |
| `--text-muted` | `#6B6254` | Secondary/muted text |
| `--text-subtle` | `#A09080` | Placeholder, tertiary |
| `--accent` | `#2D5016` | Primary green (deep forest) |
| `--accent-hover` | `#234010` | Green hover state |
| `--accent-soft` | `#E6EEE0` | Light green tint for banners/chips |
| `--accent-ring` | `rgba(45,80,22,0.18)` | Focus rings |
| `--border` | `#E4E0D8` | Default borders |
| `--border-strong` | `#CEC9BF` | Emphasized borders |

### Typography

**Add to `index.html`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Size |
|------|------|--------|------|
| Hero heading | Playfair Display | 700 | 3rem–4rem |
| Italic accent | Playfair Display Italic | 700 | inherits |
| Page titles | Playfair Display | 700 | 1.75–2.25rem |
| Section labels | DM Sans | 600 | 0.7rem uppercase tracked |
| Body, UI | DM Sans | 400–600 | 0.875–1rem |

**Add tokens:**
```css
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans: 'DM Sans', system-ui, sans-serif;
```

### Shadows & Radius

| Token | Value |
|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)` |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.10)` |
| `--r-pill` | `999px` (nav pills, chips) |
| `--r-card` | `16px` |
| `--r-input` | `10px` |

---

## Navigation

### Desktop (≥768px) — new top pill-nav

Replace the current sticky top bar with:

```
[P PantryPal]    [Add  List  Pantry 7  Settings]    [• Kroger  23423  H]
```

- Background: `--bg` with `backdrop-filter: blur(12px)`; `border-bottom: 1px solid --border`
- Nav tabs: single pill container with `border: 1px solid --border`, `border-radius: var(--r-pill)`, `background: --surface`
- Active tab: `background: #1A1A14`, `color: white`, `border-radius: var(--r-pill)` inset
- Pantry badge: dark filled circle with count, right of "Pantry" label
- Store chip: `• Kroger  23423` + avatar initial circle, right-aligned
- Height: 56px

### Mobile (<768px) — keep existing BottomNav

No changes to mobile bottom nav layout. Update colors to new tokens only.

---

## CapturePage (Add)

### Layout

Two columns on desktop (≥768px), stacked on mobile:

```
[Left: Hero copy]          [Right: Input card]
```

**Left column:**
- Store context chip: `• Shopping at Kroger · 23423` — pill-shaped, `--accent-soft` background, small green dot
- H1: Playfair Display 700, ~3.5rem, dark text  
  Line 2 contains italic green accent span: `<em style="color: var(--accent); font-style: italic">priced cart</em>`
- Subtext: DM Sans 400, `--text-muted`, 1rem, max ~50ch
- Numbered feature list (1, 2, 3): small green circled numbers, `--text-muted` body

**Right column:**
- White card, `--shadow-card`, `--r-card` radius, padding 24px
- Tab switcher: two buttons "Paste a link" / "Upload a photo", pill-grouped, active gets white bg + shadow
- `RECIPE URL` label (caps, tracked, `--text-subtle`), text input with placeholder
- `Try a sample → Creamy Tuscan Chicken Pasta` link text below input
- "Build my list →" CTA: full-width, `--accent` background, white text, `--r-pill` radius, 14px font
- Compatible sites list: muted small text at bottom

### Animations

- Card: `fade-up` (existing), 300ms delay
- CTA button: `background-color` transition 200ms on hover → `--accent-hover`
- Input focus: border color transition to `--accent`, `box-shadow: 0 0 0 3px var(--accent-ring)`

---

## ShoppingListPage (List)

### Layout

Left main panel + right sidebar on desktop (≥900px), stacked on mobile.

**Main panel:**
- "YOUR SHOPPING LIST · from budgetbytes.com" — small caps label
- Recipe title: Playfair Display 700, ~2.25rem
- Meta row: `Serves 4 · 35 min · 11 ingredients` — muted dots between
- Pantry savings banner: `--accent-soft` background, checkmark icon, skipped item names, savings amount right-aligned, "Manage" button
- Table header: `INGREDIENT | MATCHED AT KROGER | PRICE` — small caps, `--border` bottom
- Grouped sections: category label (e.g. `PRODUCE`) with item count right
  - Per row: ingredient name + quantity chip + raw text chip | product name + size + confidence badge | price + "Remove" link
  - "Swap · N more ↓" expansion link per row
- "New recipe" button: top right, outlined style

**Right sidebar card:**
- `Your cart` heading, DM Sans 600
- Store chip: `• Kroger · 23423`
- Line items: `8 items to buy  $24.02`, `Pantry staples  -$12.97`
- Divider, large total: `$24.02`, Playfair Display
- `Estimated total` label + update timestamp + accuracy note
- "Send to Kroger cart" CTA: full-width dark green
- "Share list" secondary: full-width outlined
- Footer note: small muted text

### Animations

- Pantry banner: `fade-in` on mount
- Row hover: `background: --bg-elevated` transition 150ms
- Price: `CountUp` animation (already exists in codebase)
- Sidebar: sticky on desktop, stacks below main content on mobile

---

## PantryPage (Pantry)

### Layout

Single centered column, max-width 640px.

- Page title: Playfair Display 700, ~2rem
- Subtitle: DM Sans, `--text-muted`
- Staples list: white card, `--shadow-card`, `--r-card`
  - Each row: green dot · item name + optional "in this recipe" chip · `On hand · ~$X.XX value` muted text · toggle right
  - `in this recipe` chip: `--accent-soft` background, `--accent` text, small, pill-shaped
  - Toggle: custom CSS toggle, track `--accent` when on, `--border-strong` when off
  - Hover row: `--bg-elevated` bg transition 150ms
- Footer: `Pre-seeded with common staples · 7 currently on hand` — muted centered text

### Animations

- Toggle: track `background-color` 200ms, thumb `transform: translateX` 200ms
- Row entering pantry: `fade-up` staggered 50ms per item

---

## SettingsPage (Settings)

### Layout

Single centered column, max-width 640px.

- Page title: Playfair Display 700
- Two cards:

**Card 1 — YOUR STORE:**
- `Preferred store` row → `• Kroger` value right
- `Zip code` row → value right
- `Pricing mode` row → pill chip `Live API pricing` right

**Card 2 — LIST PREFERENCES:**
- `Default to cheapest match` + subtitle → toggle right
- `Flag low-confidence items` + subtitle → toggle right

- Footer note: small muted privacy disclaimer

---

## Animations — Global

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Page transition | `startViewTransition` (existing) | 300ms | ease-out-quart |
| Page content entrance | `fade-up` (existing) | 240ms | ease-out-expo |
| Staggered list items | `fade-up` + `animation-delay: N*50ms` | 200ms | ease-out |
| Card hover | `translateY(-2px)` + shadow deepen | 200ms | ease-out |
| Button hover | `background-color` shift | 150ms | ease |
| Input focus | border + ring | 150ms | ease |
| Toggle track | `background-color` | 200ms | ease |
| Toggle thumb | `translateX` | 200ms | ease-out |
| Reduced motion | all transitions disabled | — | `prefers-reduced-motion: reduce` |

---

## File Change Map

| File | Change |
|------|--------|
| `src/styles/tokens.css` | Update color tokens, add font tokens |
| `index.html` | Add Playfair Display Google Font link |
| `src/style.css` | Update base body font, heading font-family |
| `src/components/BottomNav.tsx` | Desktop: rebuild as top pill-nav; mobile: update colors only |
| `src/pages/CapturePage.tsx` | Two-column layout, hero copy, styled input card |
| `src/pages/ShoppingListPage.tsx` | Two-column with sidebar cart, category grouping, product chips |
| `src/pages/PantryPage.tsx` | Centered card list, "in this recipe" chips, custom toggles |
| `src/pages/SettingsPage.tsx` | Two section cards, row layout per setting |
| `src/components/PageShell.tsx` | Use Playfair Display for title |
| `src/components/Button.tsx` | Update radius/sizing to match pill style |
| `src/components/Chip.tsx` | Add `accent-soft` variant |
| `src/components/Card.tsx` | Update shadow/radius to new tokens |

---

## Out of Scope

- No changes to API layer, database, or business logic
- No new routing system
- No dark mode
- No new npm dependencies
- No changes to `src/hooks/` or `src/lib/`
