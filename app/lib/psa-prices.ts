export interface PSAPrices {
  psa7: number | null
  psa8: number | null
  psa9: number | null
  psa10: number | null
  source: string
}

export async function getPSAPrices(cardName: string, game: string): Promise<PSAPrices | null> {
  try {
    const searchTerm = encodeURIComponent(`${cardName} ${game}`)
    const res = await fetch(
      `https://www.psacard.com/publicapi/auction/search?searchTerm=${searchTerm}&itemType=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    )

    if (!res.ok) return null
    const data = await res.json()

    if (!data?.items || data.items.length === 0) return null

    // Groupe par grade et calcule la moyenne des ventes récentes
    const byGrade: Record<number, number[]> = {}
    data.items.forEach((item: { grade: number; currentValue: number }) => {
      if (!byGrade[item.grade]) byGrade[item.grade] = []
      if (item.currentValue > 0) byGrade[item.grade].push(item.currentValue)
    })

    const avg = (prices: number[]) => prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100
      : null

    return {
      psa7: avg(byGrade[7] || []),
      psa8: avg(byGrade[8] || []),
      psa9: avg(byGrade[9] || []),
      psa10: avg(byGrade[10] || []),
      source: 'PSA Price Guide'
    }
  } catch {
    return null
  }
}
