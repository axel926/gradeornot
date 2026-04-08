export interface PriceChartingData {
  raw: number | null
  psa7: number | null
  psa8: number | null
  psa9: number | null
  psa10: number | null
  volume: number | null
  source: string
}

export async function getPriceChartingData(cardName: string, game: string): Promise<PriceChartingData | null> {
  try {
    const gameSlug = game.toLowerCase().includes('pokemon') ? 'pokemon'
      : game.toLowerCase().includes('magic') ? 'magic-the-gathering'
      : game.toLowerCase().includes('one piece') ? 'one-piece-card-game'
      : game.toLowerCase().includes('yu-gi-oh') ? 'yugioh'
      : game.toLowerCase().includes('lorcana') ? 'disney-lorcana'
      : null

    if (!gameSlug) return null

    const searchName = cardName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const url = `https://www.pricecharting.com/api/product?id=${searchName}&status=price`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.status === 'error') return null

    // PriceCharting retourne les prix en cents
    const cents = (val: number | null) => val ? Math.round(val / 100 * 100) / 100 : null

    return {
      raw: cents(data['loose-price'] || data['ungraded-price'] || null),
      psa7: cents(data['grade-7-price'] || null),
      psa8: cents(data['grade-8-price'] || null),
      psa9: cents(data['grade-9-price'] || null),
      psa10: cents(data['grade-10-price'] || null),
      volume: data['sales-volume'] || null,
      source: 'PriceCharting'
    }
  } catch {
    return null
  }
}
