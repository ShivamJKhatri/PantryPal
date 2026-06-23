import type { VercelRequest, VercelResponse } from '@vercel/node'
import { itemFromIngredient } from './_lib/item-from-ingredient.js'

type Body = { rawText?: string }

function readBody(request: VercelRequest): Body {
  if (typeof request.body === 'string') return JSON.parse(request.body) as Body
  return (request.body ?? {}) as Body
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const rawText = readBody(request).rawText?.trim()
  if (!rawText) {
    response.status(400).json({ error: 'Missing rawText' })
    return
  }

  response.status(200).json({ item: itemFromIngredient(rawText) })
}
