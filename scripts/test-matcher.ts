import { normalizeIngredient } from '../api/_lib/normalizer.ts'
import { matchIngredient } from '../api/_lib/store-catalog.ts'

const TEST_CASES = [
  // Standard cases
  '2 cups all-purpose flour',
  '1/2 cup granulated sugar',
  '3 large eggs',
  '1 cup whole milk',
  '4 tablespoons unsalted butter',
  '2 tbsp olive oil',
  '4 cloves garlic, minced',
  '1 medium yellow onion, diced',
  '1 lb ground beef',
  '2 boneless skinless chicken breasts',
  '1 cup heavy cream',
  '1/2 cup grated parmesan cheese',
  '8 oz shredded mozzarella',
  '1 can (14.5 oz) diced tomatoes',
  '2 cups chicken broth',
  '1 tbsp tomato paste',
  '3 tbsp soy sauce',
  '1 tsp paprika',
  '1 tsp cumin',
  '1/2 tsp red pepper flakes',
  '1 lb spaghetti',
  '2 cups penne',
  '1 cup long-grain white rice',
  '1 pint cherry tomatoes',
  '2 medium russet potatoes',
  '1 bunch fresh basil',
  '1/2 lb salmon fillet',
  '8 oz cream cheese, softened',
  '1 cup Greek yogurt',
  '4 strips bacon',
  '1 tbsp dijon mustard',
  '2 tbsp honey',
  '1/4 cup panko breadcrumbs',
  '1 tbsp cornstarch',
  '1 tsp baking powder',
  '1/2 tsp vanilla extract',
  '1 can coconut milk',
  '2 tbsp Worcestershire sauce',
  '1 lb shrimp, peeled and deveined',
  '2 avocados',
  '1 lime, juiced',
  '3 stalks celery, chopped',
  'Salt and pepper to taste',
  '2 tsp garlic powder',
  // Tricky / edge cases
  '1 (15 oz) can black beans',
  '2 x 14oz cans crushed tomatoes',
  '200g feta cheese, crumbled',
  '3 medium carrots, peeled and sliced',
  '1 large zucchini, cut into chunks',
  '1/4 cup fresh lemon juice',
  'freshly ground black pepper',
  '2 cups baby spinach',
  '1 head of broccoli, cut into florets',
  '8 button mushrooms, sliced',
  '1 red bell pepper, julienned',
  '2 Italian sausage links',
  '1 lb pork chops',
  '6 oz fettuccine',
  '1 cup beef broth',
  '2 tbsp brown sugar',
  '1 cup powdered sugar',
]

let matched = 0
let unmatched = 0
const unmatchedList: Array<{ raw: string; normalized: string }> = []

for (const raw of TEST_CASES) {
  const normalized = normalizeIngredient(raw)
  const result = matchIngredient(raw)
  if (result) {
    matched++
    console.log('✓  ' + raw.padEnd(50) + '  →  [' + normalized + ']  →  ' + result.name)
  } else {
    unmatched++
    unmatchedList.push({ raw, normalized })
    console.log('✗  ' + raw.padEnd(50) + '  →  [' + normalized + ']  →  NO MATCH')
  }
}

console.log('\n' + '─'.repeat(70))
console.log('  ' + matched + ' matched  |  ' + unmatched + ' unmatched  out of ' + TEST_CASES.length)
if (unmatchedList.length > 0) {
  console.log('\nMisses (raw  →  normalized):')
  unmatchedList.forEach(u => console.log('  "' + u.raw + '"  →  "' + u.normalized + '"'))
}
