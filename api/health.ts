import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    ok: true,
    service: 'Lettuce Eat API',
    message: 'mock response — DB not required for this endpoint',
  })
}
