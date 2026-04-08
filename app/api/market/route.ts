import { NextRequest, NextResponse } from 'next/server'
import { getMarketData } from '../../lib/market'
import { getEbaySoldListings } from '../../lib/ebay'
import { getCardmarketData } from '../../lib/cardmarket'

export async function POST(req: NextRequest) {
  try {
    const { cardName, game, setName } = await req.json()
    if (!cardName || !game) return NextResponse.json({ error: 'Missing card info' }, { status: 400 })

    const [baseData, ebayData, cardmarketData] = await Promise.all([
      getMarketData(cardName, game, setName),
      getEbaySoldListings(cardName, game, setName),
      getCardmarketData(cardName, game),
    ])

    if (!baseData && !ebayData) return NextResponse.json({ data: null })

    let data = baseData

    if (ebayData && baseData) {
      data = {
        ...baseData,
        raw: ebayData.raw.count > 0 ? ebayData.raw : baseData.raw,
        grades: {
          psa7: ebayData.grades.psa7 || baseData.grades.psa7,
          psa8: ebayData.grades.psa8 || baseData.grades.psa8,
          psa9: ebayData.grades.psa9 || baseData.grades.psa9,
          psa10: ebayData.grades.psa10 || baseData.grades.psa10,
        },
        volume: ebayData.volume,
        trends: { days7: ebayData.trends.days7 || baseData.trends.days7, days30: baseData.trends.days30 },
        source: ebayData.raw.count > 0 ? `eBay + ${baseData.source}` : baseData.source,
        gradeSource: ebayData.grades.psa10 ? 'eBay Sold Listings' : baseData.gradeSource,
      }
    }

    return NextResponse.json({ data, cardmarket: cardmarketData })
  } catch (err) {
    console.error('Market data error:', err)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
