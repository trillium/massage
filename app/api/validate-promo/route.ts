import { NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/promoCodes'

export async function POST(request: Request) {
  const { code } = await request.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
  const promo = validatePromoCode(code)
  if (!promo) return NextResponse.json({ valid: false })
  return NextResponse.json({
    valid: true,
    discount: promo.discount,
    description: promo.description,
  })
}
