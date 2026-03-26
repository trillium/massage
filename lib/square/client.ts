import { SquareClient, SquareEnvironment } from 'square'

let cachedClient: SquareClient | null = null

export function getSquareClient(): SquareClient {
  if (cachedClient) return cachedClient

  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) throw new Error('SQUARE_ACCESS_TOKEN is not set')

  cachedClient = new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  })

  return cachedClient
}

export function getSquareLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID
  if (!id) throw new Error('SQUARE_LOCATION_ID is not set')
  return id
}
