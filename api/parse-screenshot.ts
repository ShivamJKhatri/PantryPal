import type { VercelRequest, VercelResponse } from '@vercel/node'

import { extractRecipeFromImage } from './_lib/vision/extract-recipe.js'

type ParseScreenshotBody = {
  imageBase64?: string
  mediaType?: string
}

function readBody(request: VercelRequest): ParseScreenshotBody {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as ParseScreenshotBody
  }
  return (request.body ?? {}) as ParseScreenshotBody
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = readBody(request)
    const imageBase64 = body.imageBase64?.trim()
    const mediaType = body.mediaType?.trim() || 'image/jpeg'

    if (!imageBase64) {
      response.status(400).json({ error: 'Missing imageBase64 in request body' })
      return
    }

    const imageBytes = Uint8Array.from(Buffer.from(imageBase64, 'base64'))

    if (imageBytes.length === 0) {
      response.status(400).json({ error: 'imageBase64 is empty or invalid' })
      return
    }

    const result = await extractRecipeFromImage(imageBytes, mediaType)

    response.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    response.status(500).json({ error: message })
  }
}
