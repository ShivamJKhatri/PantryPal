export default function handler(_request: Request): Response {
  return Response.json({
    ok: true,
    service: 'PantryPal API',
    message: 'mock response — DB not required for this endpoint',
  })
}
