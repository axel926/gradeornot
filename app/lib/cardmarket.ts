export interface CardmarketData {
  raw: {
    avg1: number | null
    avg7: number | null
    avg30: number | null
    trendPrice: number | null
    lowPrice: number | null
  }
  source: string
}

export async function getCardmarketData(cardName: string, game: string): Promise<CardmarketData | null> {
  try {
    const gameId = game.toLowerCase().includes('pokemon') ? 'Pokemon'
      : game.toLowerCase().includes('magic') ? 'Magic'
      : game.toLowerCase().includes('yu-gi-oh') ? 'YuGiOh'
      : game.toLowerCase().includes('one piece') ? 'OnePiece'
      : game.toLowerCase().includes('lorcana') ? 'Lorcana'
      : null

    if (!gameId) return null

    const searchName = encodeURIComponent(cardName)
    const res = await fetch(
      `https://api.cardmarket.com/ws/v2.0/output.json/products/find?search=${searchName}&idGame=${gameId}&idLanguage=1`,
      {
        headers: {
          'Authorization': `OAuth realm="https://api.cardmarket.com"`,
        },
        next: { revalidate: 3600 }
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    const product = data?.product?.[0]
    if (!product) return null

    return {
      raw: {
        avg1: product.priceGuide?.AVG1 || null,
        avg7: product.priceGuide?.AVG7 || null,
        avg30: product.priceGuide?.AVG30 || null,
        trendPrice: product.priceGuide?.TREND || null,
        lowPrice: product.priceGuide?.LOW || null,
      },
      source: 'Cardmarket'
    }
  } catch {
    return null
  }
}
