# LettucEat

Turn any recipe into a priced shopping list for your store.

Paste a recipe URL. LettucEat reads the ingredients, looks up real prices at
your local store, and gives you a cart-ready list with a total. Mark the
staples you already own and the list narrows to only what you need.

---

## Features

- **Recipe to list in seconds** — paste any recipe URL and get every
  ingredient mapped to a real store price
- **Pantry tracker** — mark ingredients you always have on hand; they drop
  off your shopping list automatically
- **Store-aware pricing** — prices pull from real inventory for your store
  and zip code
- **Photo upload** — can't find the URL? Upload a screenshot of the recipe

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Styling | CSS custom properties, no component library |
| Transitions | CSS View Transitions API |
| Recipe parsing | AI model (ingredient extraction + quantity normalization) |
| Pricing | Real-time store inventory API |
| Persistence | localStorage (pantry staples) |

---

## Getting started

```bash
git clone https://github.com/ShivamJKhatri/LettucEat.git
cd LettucEat
npm install
npm run dev
