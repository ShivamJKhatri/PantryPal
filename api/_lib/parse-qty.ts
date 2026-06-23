// ponytail: leading integer/fraction only — no unit↔package math yet
export function parseLeadingQty(rawText: string): number {
  const m = rawText.trim().match(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)/)
  if (!m) return 1
  const token = m[1]
  if (token.includes('/')) {
    const [a, b] = token.split('/').map((s) => Number(s.trim()))
    if (!b) return 1
    return Math.max(1, Math.round(a / b))
  }
  const n = Number(token)
  return Number.isFinite(n) ? Math.max(1, Math.round(n)) : 1
}
