import { chromium } from 'playwright'

const BASE = 'http://localhost:5274'
let passed = 0
let failed = 0

function ok(label) { console.log('  ✓ ' + label); passed++ }
function fail(label, err) { console.error('  ✗ ' + label + ': ' + err); failed++ }

const MOCK_LIST = {
  id: 'list-test-1',
  recipeId: 'recipe-test-1',
  recipeTitle: 'Test Pasta',
  recipeDescription: 'A classic Italian pasta with rich meat sauce.',
  recipeServings: '4 servings',
  recipePrepTime: '10 min',
  recipeCookTime: '30 min',
  recipeSteps: [
    'Boil a large pot of salted water. Cook spaghetti until al dente.',
    'Brown ground beef in a skillet over medium-high heat. Drain excess fat.',
    'Add minced garlic and cook 1 minute until fragrant.',
    'Pour in tomato sauce and simmer 15 minutes.',
    'Serve sauce over spaghetti and drizzle with olive oil.',
  ],
  sourceUrl: 'https://example.com/pasta-recipe',
  storeId: 'store-kroger',
  zipCode: '10001',
  estimatedTotal: 19.15,
  currency: 'USD',
  createdAt: '2026-06-22T00:00:00.000Z',
  items: [
    { id: 'i1', ingredientName: 'spaghetti', rawText: '1 lb spaghetti', productId: 'p1', productName: 'Barilla Spaghetti', productBrand: 'Barilla', aisle: 'Pasta', price: 1.99, quantityToBuy: 1, lineTotal: 1.99, excluded: false, hasLeftovers: false, notFound: false },
    { id: 'i2', ingredientName: 'ground beef', rawText: '1 lb ground beef', productId: 'p2', productName: 'Ground Beef 80/20', aisle: 'Meat', price: 5.99, quantityToBuy: 1, lineTotal: 5.99, excluded: false, hasLeftovers: false, notFound: false },
    { id: 'i3', ingredientName: 'tomato sauce', rawText: '2 cups tomato sauce', productId: 'p3', productName: "Hunt's Tomato Sauce", productBrand: "Hunt's", aisle: 'Canned Goods', price: 1.29, quantityToBuy: 1, lineTotal: 1.29, excluded: false, hasLeftovers: false, notFound: false },
    { id: 'i4', ingredientName: 'garlic', rawText: '4 cloves garlic', productId: 'p4', productName: 'Garlic Bulb', aisle: 'Produce', price: 0.89, quantityToBuy: 1, lineTotal: 0.89, excluded: false, hasLeftovers: false, notFound: false },
    { id: 'i5', ingredientName: 'olive oil', rawText: '2 tbsp olive oil', productId: 'p5', productName: 'Kirkland Olive Oil', aisle: 'Oil & Vinegar', price: 8.99, quantityToBuy: 1, lineTotal: 8.99, excluded: false, hasLeftovers: true, notFound: false },
  ],
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()

await page.route('**/api/parse-url', route => {
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LIST) })
})
await page.route('**/api/match-item', route => {
  const body = JSON.parse(route.request().postData() ?? '{}')
  const raw = body.rawText ?? 'item'
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      item: {
        id: 'manual-1',
        ingredientName: 'butter',
        rawText: raw,
        productId: 'p-butter',
        productName: 'Unsalted Butter',
        aisle: 'Dairy',
        price: 4.49,
        quantityToBuy: 1,
        lineTotal: 4.49,
        excluded: false,
        hasLeftovers: true,
        notFound: false,
      },
    }),
  })
})
await page.route('**/api/parse-screenshot', route => {
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LIST) })
})
await page.route('**/api/store-options*', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      stores: [
        { id: 'store-walmart',    name: 'Walmart',     distance: 0.8, travelCost: 0.20, groceryEstimate: null, totalWithTravel: 0.20 },
        { id: 'store-kroger',     name: 'Kroger',      distance: 1.2, travelCost: 0.29, groceryEstimate: null, totalWithTravel: 0.29 },
        { id: 'store-safeway',    name: 'Safeway',     distance: 2.1, travelCost: 0.52, groceryEstimate: null, totalWithTravel: 0.52 },
        { id: 'store-target',     name: 'Target',      distance: 3.4, travelCost: 0.84, groceryEstimate: null, totalWithTravel: 0.84 },
        { id: 'store-publix',     name: 'Publix',      distance: 4.0, travelCost: 0.99, groceryEstimate: null, totalWithTravel: 0.99 },
        { id: 'store-wholefoods', name: 'Whole Foods', distance: 5.5, travelCost: 1.36, groceryEstimate: null, totalWithTravel: 1.36 },
      ],
      gasPrice: 3.45,
      mpg: 28,
    }),
  })
})

const consoleErrors = []
page.on('console', msg => { if (msg.type() === 'error') { consoleErrors.push(msg.text()) } })
page.on('pageerror', err => { consoleErrors.push(err.message) })

async function clickNav(index) {
  await page.locator('.bottom-nav__tab').nth(index).click()
}

// ── 1. App loads ─────────────────────────────────────────────────────────────
console.log('\n[1] App loads')
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 })
  const title = await page.title()
  if (title === 'LettuceEat') { ok('title is LettuceEat') } else { fail('title', 'got ' + title) }
} catch (e) { fail('page load', e.message) }

// ── 2. Nav (hidden during onboarding) ─────────────────────────────────────────
console.log('\n[2] Bottom nav hidden during onboarding')
try {
  const tabsDuringOnboarding = await page.$$('.bottom-nav__tab')
  if (tabsDuringOnboarding.length === 0) { ok('nav hidden during onboarding') } else { fail('nav hidden', 'tabs visible') }
} catch (e) { fail('nav', e.message) }

// ── 3. Onboarding / Settings page ────────────────────────────────────────────
console.log('\n[3] Onboarding — ZIP first, then ranked stores')
try {
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('Welcome to LettuceEat')) {
    ok('onboarding shown on first visit')
  } else {
    fail('onboarding h1', 'got: ' + h1)
  }

  // Step 1: ZIP entry
  await page.waitForSelector('#zip', { timeout: 3000 })
  await page.fill('#zip', '10001')
  ok('ZIP entered')

  // Advance to store ranking (triggers mocked /api/store-options)
  await page.click('button[type="submit"]')
  await page.waitForSelector('.store-rank-btn', { timeout: 5000 })
  ok('store ranking shown after ZIP submitted')

  // Best store is auto-selected; verify at least one button is present
  const rankBtns = await page.$$('.store-rank-btn')
  if (rankBtns.length === 6) { ok('all 6 stores ranked') } else { fail('store rank count', 'got ' + rankBtns.length) }

  // Click "Get started" — best store already selected
  await page.click('button[type="submit"]')
  // Partner redesigned capture page heading to "Your groceries, turned into a priced cart"
  await page.waitForFunction(() => document.querySelector('h1')?.textContent?.toLowerCase().includes('groceries'), { timeout: 3000 })
  ok('onboarding saved → navigated to capture page')

  const tabs = await page.$$('.bottom-nav__tab')
  if (tabs.length === 4) { ok('4 nav tabs after onboarding') } else { fail('nav tabs after onboarding', 'got ' + tabs.length) }
} catch (e) { fail('onboarding', e.message) }

// ── 4. Capture page ───────────────────────────────────────────────────────────
console.log('\n[4] Capture page')
try {
  const h1 = await page.textContent('h1')
  if (h1 && (h1.toLowerCase().includes('groceries') || h1.toLowerCase().includes('recipe'))) {
    ok('capture h1 present: ' + h1.trim().replace(/\s+/g, ' '))
  } else { fail('h1', h1) }

  const urlInput = await page.$('input[type="url"]')
  if (urlInput) { ok('URL input present') } else { fail('URL input', 'missing') }

  const tabs = await page.$$('.tabs__btn')
  if (tabs.length === 2) { ok('capture tabs present') } else { fail('capture tabs', 'got ' + tabs.length) }

  const chip = await page.$('.store-chip')
  if (chip) { ok('store chip shown') } else { fail('store chip', 'missing') }
} catch (e) { fail('capture page', e.message) }

// ── 5. Submit disabled when empty ────────────────────────────────────────────
console.log('\n[5] Submit button disabled when URL empty')
try {
  const disabled = await page.$eval('button[type="submit"]', b => b.disabled)
  if (disabled) { ok('submit disabled when empty') } else { fail('submit disabled', 'not disabled') }
} catch (e) { fail('URL validation', e.message) }

// ── 6. Recipe -> Shopping List ────────────────────────────────────────────────
console.log('\n[6] Recipe -> Shopping List (mocked API)')
try {
  await page.fill('input[type="url"]', 'https://example.com/pasta-recipe')
  const stillDisabled = await page.$eval('button[type="submit"]', b => b.disabled)
  if (!stillDisabled) { ok('submit enabled after URL typed') } else { fail('submit enabled', 'still disabled') }

  await page.click('button[type="submit"]')
  // App navigates to "My Recipes" list view first after adding a recipe
  await page.waitForFunction(() => {
    const h = document.querySelector('h1')
    return h && h.textContent?.includes('My Recipes')
  }, { timeout: 5000 })
  ok('navigated to My Recipes after submit')

  // Click the recipe card to open the detail view
  await page.waitForSelector('.recipe-card__main', { timeout: 3000 })
  await page.click('.recipe-card__main')
  await page.waitForFunction(() => {
    const h = document.querySelector('h1')
    return h && h.textContent?.includes('Test Pasta')
  }, { timeout: 3000 })
  const listH1 = await page.textContent('h1')
  ok('opened recipe detail: ' + (listH1 && listH1.trim()))
} catch (e) { fail('recipe flow', e.message) }

// ── 7. Shopping list content ─────────────────────────────────────────────────
console.log('\n[7] Shopping list content')
try {
  const items = await page.$$('.item-row')
  if (items.length > 0) { ok(items.length + ' items in list') } else { fail('items', 'none found') }

  const total = await page.textContent('.list-total-bar__amount')
  await page.waitForTimeout(400)
  const totalSettled = await page.textContent('.list-total-bar__amount')
  if (totalSettled && totalSettled.includes('$') && !totalSettled.includes('-')) {
    ok('total shows: ' + totalSettled.trim())
  } else {
    fail('total', totalSettled ?? total)
  }

  const sourceLink = await page.$('.source-link')
  if (sourceLink) { ok('source link present') } else { fail('source link', 'missing') }

  // Store picker shows all stores for this recipe
  await page.waitForSelector('.store-picker-row', { timeout: 5000 })
  const storeRows = await page.$$('.store-picker-row')
  if (storeRows.length === 6) { ok('store picker shows all 6 stores') } else { fail('store picker', 'got ' + storeRows.length + ' rows') }

  // Best value badge present
  const bestBadge = await page.$('.store-picker-badge')
  if (bestBadge) { ok('best value badge shown') } else { fail('best badge', 'missing') }

  // Selected store name shows in sidebar title
  const sidebarTitle = await page.textContent('.list-sidebar-title')
  if (sidebarTitle && sidebarTitle.trim().length > 0 && sidebarTitle.trim() !== 'Your cart') {
    ok('sidebar reflects selected store: ' + sidebarTitle.trim())
  } else { fail('sidebar store name', 'got: ' + sidebarTitle) }
} catch (e) { fail('list content', e.message) }

// ── 7c. Recipe tab ────────────────────────────────────────────────────────────
console.log('\n[7c] Recipe tab')
try {
  // Already in recipe detail — click Recipe tab (aria-selected="false" = inactive tab)
  await page.click('.detail-tabs__btn[aria-selected="false"]')
  await page.waitForSelector('.recipe-steps', { timeout: 3000 })
  const steps = await page.$$('.recipe-step')
  if (steps.length > 0) { ok(steps.length + ' recipe steps shown') } else { fail('recipe steps', 'none found') }

  const metaChips = await page.$$('.recipe-meta-chip')
  if (metaChips.length > 0) { ok(metaChips.length + ' meta chips (serves/time)') } else { fail('meta chips', 'none') }

  // Switch back to list tab
  await page.click('.detail-tabs__btn[aria-selected="false"]')
  await page.waitForSelector('.item-row', { timeout: 3000 })
  ok('switched back to list tab')
} catch (e) { fail('recipe tab', e.message) }

// ── 7b. Manual add item ───────────────────────────────────────────────────────
console.log('\n[7b] Manual add item')
try {
  // Sidebar buttons may be off-screen on mobile — use JS click
  await page.locator('button:has-text("Send to cart")').evaluate(el => el.click())
  await page.waitForTimeout(200)
  await page.locator('button:has-text("Back to recipes")').evaluate(el => el.click())
  await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('My Recipes'), { timeout: 3000 })
  await page.click('.cart-header-btn')
  await page.waitForSelector('.manual-add input', { timeout: 3000 })

  const countBefore = (await page.$$('.item-row')).length
  await page.fill('.manual-add input', '1 lb butter')
  await page.click('.manual-add button[type="submit"]')
  await page.waitForTimeout(500)
  const countAfter = (await page.$$('.item-row')).length
  if (countAfter > countBefore) { ok('manual item added') } else { fail('manual add', 'count unchanged') }
} catch (e) { fail('manual add', e.message) }

// ── 8. Exclude toggle ─────────────────────────────────────────────────────────
console.log('\n[8] Exclude/include toggle')
try {
  const totalBefore = await page.textContent('.list-total-bar__amount')
  const firstExclude = await page.$('.exclude-btn:not(.excluded)')
  if (firstExclude) {
    await firstExclude.click()
    await page.waitForTimeout(400)
    const totalAfter = await page.textContent('.list-total-bar__amount')
    if (totalBefore !== totalAfter) {
      ok('total changed after exclude: ' + totalBefore + ' -> ' + totalAfter)
    } else {
      fail('total after exclude', 'unchanged at ' + totalBefore)
    }
  } else {
    fail('exclude button', 'no active exclude btn found')
  }
} catch (e) { fail('exclude toggle', e.message) }

// ── 9. Quantity +/- ─────────────────────────────────────────────────────────
console.log('\n[9] Quantity +/- controls')
try {
  const plusBtns = await page.locator('.item-qty .icon-btn').all()
  const plusBtn = plusBtns[plusBtns.length - 1]
  if (plusBtn) {
    const totalBefore = await page.textContent('.list-total-bar__amount')
    await plusBtn.click()
    await page.waitForTimeout(400)
    const totalAfter = await page.textContent('.list-total-bar__amount')
    if (totalBefore !== totalAfter) {
      ok('total changed after qty+1: ' + totalBefore + ' -> ' + totalAfter)
    } else {
      fail('qty +1', 'total unchanged at ' + totalBefore)
    }
  } else {
    fail('qty buttons', 'none found')
  }
} catch (e) { fail('qty controls', e.message) }

// ── 10. Pantry page ────────────────────────────────────────────────────────────
console.log('\n[10] Pantry page')
try {
  await clickNav(2)
  await page.waitForSelector('h1', { timeout: 3000 })
  const h1 = await page.textContent('h1')
  if (h1 && h1.toLowerCase().includes('pantry')) { ok('pantry h1: ' + h1.trim()) } else { fail('pantry h1', h1) }

  const chips = await page.$$('.chip')
  if (chips.length >= 10) { ok(chips.length + ' quick-add chips') } else { fail('chips', 'got ' + chips.length) }

  // Partner renamed .staple-row → .pantry-staple-row
  const countBefore = (await page.$$('.pantry-staple-row')).length
  await page.fill('.add-form input', 'butter')
  await page.click('.add-form button[type="submit"]')
  await page.waitForTimeout(300)
  const countAfter = (await page.$$('.pantry-staple-row')).length
  if (countAfter > countBefore) { ok('staple added') } else { fail('add staple', 'count unchanged') }

  // Partner redesigned remove as a toggle (checkbox) instead of icon-btn
  // Use evaluate to click — toggle may be under fixed bottom nav
  const removeBtn = await page.locator('.pantry-staple-row .toggle__input').first()
  if (await removeBtn.count()) {
    await removeBtn.evaluate(el => el.click())
    await page.waitForTimeout(300)
    const countAfterRemove = (await page.$$('.pantry-staple-row')).length
    if (countAfterRemove < countAfter) { ok('staple removed') } else { fail('remove staple', 'count unchanged') }
  } else {
    fail('remove button', 'not found')
  }
} catch (e) { fail('pantry page', e.message) }

// ── 11. Settings page ─────────────────────────────────────────────────────────
console.log('\n[11] Settings page')
try {
  await clickNav(3)
  // Partner redesigned to section-card layout (no .settings-form on main view)
  await page.waitForSelector('.settings-section-card', { timeout: 3000 })
  const h1 = await page.textContent('.settings-page-title')
  if (h1 && h1.includes('Settings')) { ok('settings h1: ' + h1.trim()) } else { fail('settings h1', h1) }

  // Store list: wait for store rows to load (auto-fetches on mount)
  await page.waitForSelector('.settings-store-row', { timeout: 5000 })
  const storeRows = await page.$$('.settings-store-row')
  if (storeRows.length > 0) { ok(storeRows.length + ' store options shown') } else { fail('store rows', 'none found') }

  // Current store row is highlighted
  const currentRow = await page.$('.settings-store-row.current .settings-store-row__name')
  const storeText = currentRow ? (await currentRow.textContent() ?? '').trim() : ''
  if (storeText) { ok('current store shown: ' + storeText) } else { fail('store shown', 'not found') }

  // ZIP shown in header
  const zipText = await page.textContent('.settings-stores-zip')
  if (zipText && zipText.includes('10001')) { ok('zip shown: ' + zipText.trim()) } else { fail('zip shown', 'got: ' + zipText) }
} catch (e) { fail('settings page', e.message) }

// ── 12. Shopping List nav badge ───────────────────────────────────────────────
console.log('\n[12] Shopping List nav shows indicator after recipe loaded')
try {
  const badge = await page.locator('.bottom-nav__tab').nth(1).locator('.bottom-nav__badge')
  if (await badge.count()) { ok('list nav badge present') } else { fail('list badge', 'missing') }
} catch (e) { fail('list nav', e.message) }

// ── 13. No console errors ─────────────────────────────────────────────────────
console.log('\n[13] Console errors')
if (consoleErrors.length === 0) {
  ok('no console errors')
} else {
  consoleErrors.forEach(e => { fail('console error', e) })
}

await browser.close()
console.log('\n' + '-'.repeat(42))
console.log('  ' + passed + ' passed  |  ' + failed + ' failed')
console.log('-'.repeat(42))
process.exit(failed > 0 ? 1 : 0)
