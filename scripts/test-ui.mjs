import { chromium } from 'playwright'

const BASE = 'http://localhost:5274'
let passed = 0
let failed = 0

function ok(label) { console.log('  ✓ ' + label); passed++ }
function fail(label, err) { console.error('  ✗ ' + label + ': ' + err); failed++ }

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

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
  if (buttons.length === 3) { ok('3 nav buttons') } else { fail('nav buttons', 'got ' + buttons.length) }

  const listDisabled = await page.$eval('.nav-links button:nth-child(2)', b => b.disabled)
  if (listDisabled) { ok('Shopping List button disabled before recipe added') } else { fail('list btn disabled', 'not disabled') }
} catch (e) { fail('nav', e.message) }

// ── 3. Capture page ───────────────────────────────────────────────────────────
console.log('\n[3] Capture page')
try {
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('Add a Recipe')) { ok('h1: ' + h1.trim()) } else { fail('h1', h1) }

  const urlInput = await page.$('input[type="url"]')
  if (urlInput) { ok('URL input present') } else { fail('URL input', 'missing') }

  const uploadBtn = await page.$('.upload-btn')
  if (uploadBtn) { ok('Upload Screenshot button present') } else { fail('upload btn', 'missing') }
} catch (e) { fail('capture page', e.message) }

// ── 4. Submit disabled when empty ────────────────────────────────────────────
console.log('\n[4] Submit button disabled when URL empty')
try {
  const disabled = await page.$eval('button[type="submit"]', b => b.disabled)
  if (disabled) { ok('submit disabled when empty') } else { fail('submit disabled', 'not disabled') }
} catch (e) { fail('URL validation', e.message) }

// ── 5. Mock recipe flow ───────────────────────────────────────────────────────
console.log('\n[5] Recipe -> Shopping List (dev mock)')
try {
  await page.fill('input[type="url"]', 'https://example.com/pasta-recipe')
  const stillDisabled = await page.$eval('button[type="submit"]', b => b.disabled)
  if (!stillDisabled) { ok('submit enabled after URL typed') } else { fail('submit enabled', 'still disabled') }

  await page.click('button[type="submit"]')
  // Wait for list page (mock takes ~1.2s)
  await page.waitForFunction(() => {
    const h = document.querySelector('h1')
    return h && !h.textContent.includes('Add a Recipe')
  }, { timeout: 5000 })
  const listH1 = await page.textContent('h1')
  ok('navigated to list: ' + (listH1 && listH1.trim()))
} catch (e) { fail('recipe flow', e.message) }

// ── 6. Shopping list content ─────────────────────────────────────────────────
console.log('\n[6] Shopping list content')
try {
  const items = await page.$$('.item-row')
  if (items.length > 0) { ok(items.length + ' items in list') } else { fail('items', 'none found') }

  const total = await page.textContent('.list-total strong')
  if (total && total.includes('$')) { ok('total shows: ' + total.trim()) } else { fail('total', total) }

  const sourceLink = await page.$('.source-link')
  if (sourceLink) { ok('source link present') } else { fail('source link', 'missing') }
} catch (e) { fail('list content', e.message) }

// ── 7. Exclude toggle ─────────────────────────────────────────────────────────
console.log('\n[7] Exclude/include toggle')
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

// ── 8. Quantity +/- ───────────────────────────────────────────────────────────
console.log('\n[8] Quantity +/- controls')
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

// ── 9. Pantry page ────────────────────────────────────────────────────────────
console.log('\n[9] Pantry page')
try {
  await page.click('.nav-links button:nth-child(3)')
  await page.waitForSelector('h1', { timeout: 3000 })
  const h1 = await page.textContent('h1')
  if (h1 && h1.includes('My Pantry')) { ok('pantry h1: ' + h1.trim()) } else { fail('pantry h1', h1) }

  const staples = await page.$$('.staple-row')
  if (staples.length > 0) { ok(staples.length + ' default staples') } else { fail('staples', 'none shown') }

  await page.fill('.add-form input', 'butter')
  await page.click('.add-form button')
  await page.waitForTimeout(200)
  const staplesAfter = await page.$$('.staple-row')
  if (staplesAfter.length > staples.length) { ok('staple added') } else { fail('add staple', 'count unchanged') }

  const removeBtn = await page.$('.remove-btn')
  if (removeBtn) {
    await removeBtn.click()
    await page.waitForTimeout(200)
    const afterRemove = await page.$$('.staple-row')
    if (afterRemove.length < staplesAfter.length) { ok('staple removed') } else { fail('remove staple', 'count unchanged') }
  }
} catch (e) { fail('pantry page', e.message) }

// ── 10. Shopping List button enabled now ──────────────────────────────────────
console.log('\n[10] Shopping List nav enabled after recipe loaded')
try {
  const listDisabled = await page.$eval('.nav-links button:nth-child(2)', b => b.disabled)
  if (!listDisabled) { ok('Shopping List nav now enabled') } else { fail('list nav enabled', 'still disabled') }
} catch (e) { fail('list nav', e.message) }

// ── 11. No console errors ─────────────────────────────────────────────────────
console.log('\n[11] Console errors')
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
