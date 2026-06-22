import { parseRecipeFromUrl } from '../api/_lib/url-parser.ts'
import { buildShoppingList } from '../api/_lib/build-shopping-list.ts'

const url = process.argv[2]
if (!url) {
  console.error('Usage: npx tsx scripts/test-url-parse.ts <recipe-url>')
  process.exit(1)
}

console.log('Fetching:', url)
console.log('─'.repeat(60))

const extracted = await parseRecipeFromUrl(url)

console.log('Title:      ', extracted.title)
console.log('Ingredients:', extracted.ingredients.length)
console.log('Steps:      ', extracted.steps.length)
console.log('\nIngredients extracted:')
extracted.ingredients.forEach((i) => console.log('  ' + i.sortOrder + '. ' + i.rawText))

console.log('\n' + '─'.repeat(60))
console.log('Building shopping list...')

const list = await buildShoppingList(extracted, { sourceType: 'url', sourceUrl: url })

console.log('\nShopping list: ' + list.recipeTitle)
console.log('Items: ' + list.items.length)
console.log('')

const found = list.items.filter((i) => !i.notFound)
const notFound = list.items.filter((i) => i.notFound)

found.forEach((i) => {
  const tag = i.excluded ? '[excluded]' : '          '
  console.log(tag + '  ' + i.ingredientName.padEnd(30) + '  $' + i.price.toFixed(2) + '  (' + i.rawText + ')')
})

if (notFound.length > 0) {
  console.log('\nNot found in catalog (' + notFound.length + '):')
  notFound.forEach((i) => console.log('  - ' + i.rawText))
}

console.log('\n' + '─'.repeat(60))
console.log('Estimated total: $' + list.estimatedTotal.toFixed(2))
