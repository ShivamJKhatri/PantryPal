import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseRecipeFromUrl } from './_lib/url-parser.js'
import { buildShoppingList } from './_lib/build-shopping-list.js'

type ParseUrlBody = {
  url?: string
}

function readBody(request: VercelRequest): ParseUrlBody {
  if (typeof request.body === 'string') return JSON.parse(request.body) as ParseUrlBody
  return (request.body ?? {}) as ParseUrlBody
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = readBody(request)
  const url = body.url?.trim()

  if (!url) {
    response.status(400).json({ error: 'Missing url in request body' })
    return
  }

  try {
    new URL(url) // validate before hitting network
  } catch {
    response.status(400).json({ error: 'Invalid URL' })
    return
  }

  try {
    const extracted = await parseRecipeFromUrl(url)
    const list = await buildShoppingList(extracted, { sourceType: 'url', sourceUrl: url })
    response.status(200).json(list)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    response.status(500).json({ error: message })
  }
}
