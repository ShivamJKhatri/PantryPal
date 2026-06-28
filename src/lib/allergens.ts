const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  Dairy:      ['milk', 'cheese', 'cream', 'butter', 'yogurt', 'whey', 'lactose', 'mozzarella',
               'parmesan', 'cheddar', 'brie', 'ricotta', 'ghee', 'half-and-half', 'sour cream',
               'heavy cream', 'heavy whipping', 'crème', 'custard', 'mascarpone', 'gouda', 'gruyère'],
  Eggs:       ['egg', 'eggs', 'mayo', 'mayonnaise', 'aioli', 'hollandaise', 'meringue'],
  Fish:       ['fish', 'cod', 'salmon', 'tuna', 'tilapia', 'halibut', 'anchovy', 'sardine',
               'bass', 'flounder', 'snapper', 'mahi', 'trout', 'mackerel', 'herring', 'sole',
               'worcestershire'],
  Shellfish:  ['shrimp', 'crab', 'lobster', 'clam', 'oyster', 'scallop', 'mussel', 'prawn',
               'crayfish', 'crawfish', 'langostino'],
  'Tree Nuts':['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia',
               'brazil nut', 'pine nut', 'chestnut', 'coconut'],
  Peanuts:    ['peanut', 'peanuts', 'peanut butter', 'groundnut'],
  Wheat:      ['wheat', 'flour', 'bread', 'pasta', 'gluten', 'semolina', 'barley', 'rye',
               'noodle', 'couscous', 'bulgur', 'farro', 'panko', 'breadcrumb', 'tortilla',
               'pita', 'crouton', 'cracker', 'spaghetti', 'linguine', 'penne', 'orzo'],
  Soy:        ['soy', 'soya', 'tofu', 'edamame', 'miso', 'tempeh', 'soybean', 'tamari',
               'teriyaki', 'hoisin'],
  Sesame:     ['sesame', 'tahini', 'sesame oil', 'sesame seed'],
}

export function detectAllergens(
  items: Array<{ ingredientName: string; rawText: string }>,
): string[] {
  const text = items.map((i) => `${i.ingredientName} ${i.rawText}`).join(' ').toLowerCase()
  return Object.entries(ALLERGEN_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => text.includes(kw)))
    .map(([name]) => name)
}
