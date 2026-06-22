const QTY_RE = /^\s*(?:\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s*/
// "x 14oz"-style multiplier that sometimes appears after a quantity
const MULTIPLIER_RE = /^x\s+/i
// Inline quantity+unit with no space (e.g. "14oz", "200g") that appears after an "x" multiplier
const INLINE_QTY_RE = /^\d+(?:\.\d+)?\s*(?:oz|g|kg|ml|l)\s+/i
const UNIT_RE =
  /^(?:cups?|tbsps?|tsps?|tablespoons?|teaspoons?|oz|ounces?|fl\.?\s*oz|lbs?|pounds?|grams?|g|kg|ml|liters?|l|cloves?|cans?|pkgs?|packages?|bunch(?:es)?|heads?|stalks?|slices?|strips?|pieces?|pcs?|pinch(?:es)?|dash(?:es)?|handfuls?|sprigs?|links?)\s+(?:of\s+)?/i
const DESC_RE =
  /^(?:large|small|medium|extra[\s-]large|xl|fresh|dried|minced|chopped|diced|sliced|thinly[\s-]sliced|grated|shredded|whole|raw|cooked|frozen|canned|boneless|skinless|peeled|crushed|ground|roasted|toasted|halved|quartered|roughly[\s-]chopped|finely[\s-]chopped)\s+/i

export function normalizeIngredient(rawText: string): string {
  let t = rawText.trim().toLowerCase()

  // 1. Strip leading quantity (fraction or decimal)
  t = t.replace(QTY_RE, '')

  // 2. Strip parens EARLY so "(15 oz) can black beans" → "can black beans" is handled below
  t = t.replace(/\(.*?\)/g, '').replace(/\s{2,}/g, ' ').trim()

  // 3. Strip "x NNunit" multipliers like "x 14oz cans"
  t = t.replace(MULTIPLIER_RE, '')
  t = t.replace(INLINE_QTY_RE, '')

  // 4. Strip unit word
  t = t.replace(UNIT_RE, '')

  // 5. Strip a second leading quantity that can follow some patterns
  t = t.replace(QTY_RE, '')

  // 6. Strip descriptor adjectives
  t = t.replace(DESC_RE, '')

  // 7. Take only text before first comma/semicolon (removes prep notes)
  t = t.split(/[,;]/)[0].trim()

  return t
}
