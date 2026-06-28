import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enforceRateLimit, RATE_LIMITS } from './_lib/rate-limit.js'

const CHAINS = [
  { id: 'store-kroger',     name: 'Kroger',      priceFactor: 1.00 },
  { id: 'store-walmart',    name: 'Walmart',     priceFactor: 0.88 },
  { id: 'store-target',     name: 'Target',      priceFactor: 1.12 },
  { id: 'store-wholefoods', name: 'Whole Foods', priceFactor: 1.35 },
  { id: 'store-safeway',    name: 'Safeway',     priceFactor: 1.05 },
  { id: 'store-publix',     name: 'Publix',      priceFactor: 1.08 },
]

// National average as of June 2026
const GAS_PRICE = 3.45
const MPG = 28

// Deterministic pseudo-random distance per (ZIP, store) pair — same ZIP always
// gives the same distances, making the demo consistent
function estimateDistance(zip: string, seed: number): number {
  let h = seed * 2654435761
  for (let i = 0; i < zip.length; i++) {
    h = (Math.imul(h ^ zip.charCodeAt(i), 0x9e3779b9) >>> 0)
  }
  // Spread: 0.5 – 9.5 miles
  const miles = (h % 90) / 10 + 0.5
  return Math.round(miles * 10) / 10
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!(await enforceRateLimit(req, res, RATE_LIMITS.storeOptions))) return

  const { zipCode, estimatedTotal } = req.query
  if (!zipCode || typeof zipCode !== 'string' || !/^\d{5}$/.test(zipCode)) {
    res.status(400).json({ error: 'zipCode must be a 5-digit string' })
    return
  }

  const baseTotal = estimatedTotal ? parseFloat(estimatedTotal as string) : 0

  const stores = CHAINS.map((chain, i) => {
    const distance = estimateDistance(zipCode, i + 1)
    const travelCost = parseFloat(((distance * 2 / MPG) * GAS_PRICE).toFixed(2))
    const groceryEstimate = baseTotal > 0
      ? parseFloat((baseTotal * chain.priceFactor).toFixed(2))
      : null
    const totalWithTravel = groceryEstimate !== null
      ? parseFloat((groceryEstimate + travelCost).toFixed(2))
      : travelCost
    return { id: chain.id, name: chain.name, distance, travelCost, groceryEstimate, totalWithTravel }
  }).sort((a, b) => a.totalWithTravel - b.totalWithTravel)

  res.json({ stores, gasPrice: GAS_PRICE, mpg: MPG })
}
