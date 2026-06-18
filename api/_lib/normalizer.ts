const QTY_RE = /^\s*(?:\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s*/
const UNIT_RE =
  /^(?:cups?|tbsps?|tsps?|tablespoons?|teaspoons?|oz|ounces?|fl\.?\s*oz|lbs?|pounds?|grams?|g|kg|ml|liters?|l|cloves?|cans?|pkgs?|packages?|bunches?|heads?|stalks?|slices?|strips?|pieces?|pcs?|pinch(?:es)?|dash(?:es)?|handfuls?|sprigs?|links?)\s+(?:of\s+)?/i
const DESC_RE =
  /^(?:large|small|medium|extra[\s-]large|xl|fresh|dried|minced|chopped|diced|sliced|thinly[\s-]sliced|grated|shredded|whole|raw|cooked|frozen|canned|boneless|skinless|peeled|crushed|ground|roasted|toasted|halved|quartered|roughly[\s-]chopped|finely[\s-]chopped)\s+/i

export function normalizeIngredient(rawText: string): string {
  let t = rawText.trim().toLowerCase()
  // Strip leading quantity
  t = t.replace(QTY_RE, '')
  // Strip unit
  t = t.replace(UNIT_RE, '')
  // Strip another quantity that may follow (e.g. "2 x 14oz cans" → "cans tomatoes")
  t = t.replace(QTY_RE, '')
  // Strip descriptors
  t = t.replace(DESC_RE, '')
  // Remove parenthetical notes like "(about 3 cloves)"
  t = t.replace(/\(.*?\)/g, '').trim()
  // Take only text before first comma/semicolon (removes prep notes)
  t = t.split(/[,;]/)[0].trim()
  return t
}
