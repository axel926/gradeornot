import { NextRequest, NextResponse } from 'next/server'
import { getMarketData } from '../../lib/market'

export async function POST(req: NextRequest) {
  try {
    const { cardName, game, setName } = await req.json()
    if (!cardName || !game) return NextResponse.json({ error: 'Missing card info' }, { status: 400 })

    const data = await getMarketData(cardName, game, setName)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Market data error:', err)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
