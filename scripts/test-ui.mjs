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
const context = await browser.newContext()
const page = await context.newPage()

// Intercept API calls so tests work without a running backend
await page.route('**/api/parse-url', route => {
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LIST) })
})
await page.route('**/api/parse-screenshot', route => {
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LIST) })
})

const consoleErrors = []
page.on('console', msg => { if (msg.type() === 'error') { consoleErrors.push(msg.text()) } })
page.on('pageerror', err => { consoleErrors.push(err.message) })

// ── 1. App loads ─────────────────────────────────────────────────────────────
console.log('\n[1] App loads')
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 })
  const title = await page.title()
  if (title === 'PantryPal') { ok('title is PantryPal') } else { fail('title', 'got ' + title) }
} catch (e) { fail('page load', e.message) }

// ── 2. Nav ────────────────────────────────────────────────────────────────────
console.log('\n[2] Nav renders')
try {
  const brand = await page.textContent('.nav-brand')
  if (brand && brand.trim() === 'PantryPal') { ok('brand text') } else { fail('brand', brand) }

  const buttons = await page.$$('.nav-links button')
  if (buttons.length === 4) { ok('4 nav buttons') } else { fail('nav buttons', 'got ' + buttons.length) }

  const listDisabled = await page.$eval('.nav-links button:nth-child(2)', b => b.disabled)
  if (listDisabled) { ok('Shopping List button disabled before recipe added') } else { fail('list btn disabled', 'not disabled') }
} catch (e) { fail('nav', e.message) }

// ── 3. Onboarding / Settings page ────────────────────────────────────────────
console.log('\n[3] Onboarding — set store + ZIP')
try {
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('Welcome to PantryPal')) {
    ok('onboarding shown on first visit')
  } else {
    fail('onboarding h1', 'got: ' + h1)
  }

  // Pick Kroger (first store button)
  const storeBtn = await page.$('.store-btn')
  if (storeBtn) {
    await storeBtn.click()
    ok('selected a store')
  } else {
    fail('store buttons', 'none found')
  }

  await page.fill('#zip', '10001')
  await page.click('.save-btn')
  await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Add a Recipe'), { timeout: 3000 })
  ok('onboarding saved → navigated to capture page')
} catch (e) { fail('onboarding', e.message) }

// ── 4. Capture page ───────────────────────────────────────────────────────────
console.log('\n[4] Capture page')
try {
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('Add a Recipe')) { ok('h1: ' + h1.trim()) } else { fail('h1', h1) }

  const urlInput = await page.$('input[type="url"]')
  if (urlInput) { ok('URL input present') } else { fail('URL input', 'missing') }

  const uploadBtn = await page.$('.upload-btn')
  if (uploadBtn) { ok('Upload Screenshot button present') } else { fail('upload btn', 'missing') }

  const badge = await page.$('.store-badge')
  if (badge) { ok('store badge shown') } else { fail('store badge', 'missing') }
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
  await page.waitForFunction(() => {
    const h = document.querySelector('h1')
    return h && !h.textContent.includes('Add a Recipe')
  }, { timeout: 5000 })
  const listH1 = await page.textContent('h1')
  ok('navigated to list: ' + (listH1 && listH1.trim()))
} catch (e) { fail('recipe flow', e.message) }

// ── 7. Shopping list content ─────────────────────────────────────────────────
console.log('\n[7] Shopping list content')
try {
  const items = await page.$$('.item-row')
  if (items.length > 0) { ok(items.length + ' items in list') } else { fail('items', 'none found') }

  const total = await page.textContent('.list-total strong')
  if (total && total.includes('$')) { ok('total shows: ' + total.trim()) } else { fail('total', total) }

  const sourceLink = await page.$('.source-link')
  if (sourceLink) { ok('source link present') } else { fail('source link', 'missing') }

  const subtitle = await page.textContent('.subtitle')
  if (subtitle && subtitle.includes('Kroger') && subtitle.includes('10001')) {
    ok('store + zip in subtitle: ' + subtitle.trim())
  } else {
    fail('store/zip subtitle', 'got: ' + subtitle)
  }
} catch (e) { fail('list content', e.message) }

// ── 8. Exclude toggle ─────────────────────────────────────────────────────────
console.log('\n[8] Exclude/include toggle')
try {
  const totalBefore = await page.textContent('.list-total strong')
  const firstExclude = await page.$('.exclude-btn:not(.excluded)')
  if (firstExclude) {
    await firstExclude.click()
    await page.waitForTimeout(300)
    const totalAfter = await page.textContent('.list-total strong')
    if (totalBefore !== totalAfter) {
      ok('total changed after exclude: ' + totalBefore + ' -> ' + totalAfter)
    } else {
      fail('total after exclude', 'unchanged at ' + totalBefore)
    }
  } else {
    fail('exclude button', 'no active exclude btn found')
  }
} catch (e) { fail('exclude toggle', e.message) }

// ── 9. Quantity +/- ───────────────────────────────────────────────────────────
console.log('\n[9] Quantity +/- controls')
try {
  const plusBtns = await page.$$('.item-qty button:last-child')
  if (plusBtns.length > 0) {
    const totalBefore = await page.textContent('.list-total strong')
    await plusBtns[0].click()
    await page.waitForTimeout(300)
    const totalAfter = await page.textContent('.list-total strong')
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
  await page.click('.nav-links button:nth-child(3)')
  await page.waitForSelector('h1', { timeout: 3000 })
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('My Pantry')) { ok('pantry h1: ' + h1.trim()) } else { fail('pantry h1', h1) }

  const countBefore = (await page.$$('.staple-row')).length
  await page.fill('.add-form input', 'butter')
  await page.click('.add-form button')
  await page.waitForTimeout(200)
  const countAfter = (await page.$$('.staple-row')).length
  if (countAfter > countBefore) { ok('staple added') } else { fail('add staple', 'count unchanged') }

  const removeBtn = await page.$('.remove-btn')
  if (removeBtn) {
    await removeBtn.click()
    await page.waitForTimeout(200)
    const countAfterRemove = (await page.$$('.staple-row')).length
    if (countAfterRemove < countAfter) { ok('staple removed') } else { fail('remove staple', 'count unchanged') }
  } else {
    fail('remove button', 'not found')
  }
} catch (e) { fail('pantry page', e.message) }

// ── 11. Settings page ─────────────────────────────────────────────────────────
console.log('\n[11] Settings page')
try {
  await page.click('.nav-links button:nth-child(4)')
  await page.waitForSelector('.settings-form', { timeout: 3000 })
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('Settings')) { ok('settings h1: ' + h1.trim()) } else { fail('settings h1', h1) }

  const storeSelected = await page.$('.store-btn.selected')
  if (storeSelected) {
    const name = await storeSelected.textContent()
    ok('store selected: ' + name.trim())
  } else {
    fail('store selected', 'none highlighted')
  }

  const zipVal = await page.$eval('#zip', el => el.value)
  if (zipVal === '10001') { ok('zip persisted: ' + zipVal) } else { fail('zip persisted', 'got: ' + zipVal) }
} catch (e) { fail('settings page', e.message) }

// ── 12. Shopping List nav still enabled ───────────────────────────────────────
console.log('\n[12] Shopping List nav enabled after recipe loaded')
try {
  const listDisabled = await page.$eval('.nav-links button:nth-child(2)', b => b.disabled)
  if (!listDisabled) { ok('Shopping List nav now enabled') } else { fail('list nav enabled', 'still disabled') }
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
