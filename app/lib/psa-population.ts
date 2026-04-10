export interface PSAPopulation {
  total: number
  byGrade: {
    grade10: number
    grade9: number
    grade8: number
    grade7: number
    grade6andBelow: number
  }
  probabilities: {
    psa10: number
    psa9: number
    psa8: number
    psa7: number
  }
  source: string
}

export async function getPSAPopulation(cardName: string, game: string): Promise<PSAPopulation | null> {
  try {
    const searchTerm = encodeURIComponent(`${cardName} ${game}`)
    const res = await fetch(
      `https://www.psacard.com/publicapi/pop/search?searchTerm=${searchTerm}&itemType=0&pageSize=1`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        next: { revalidate: 86400 } // cache 24h
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    if (!data?.items || data.items.length === 0) return null

    const item = data.items[0]
    const pop = item.gradeCounts || {}

    const grade10 = (pop['10'] || 0) + (pop['PSA 10'] || 0)
    const grade9 = (pop['9'] || 0) + (pop['PSA 9'] || 0)
    const grade8 = (pop['8'] || 0) + (pop['PSA 8'] || 0)
    const grade7 = (pop['7'] || 0) + (pop['PSA 7'] || 0)
    const grade6andBelow = Object.entries(pop)
      .filter(([k]) => parseInt(k) <= 6)
      .reduce((a, [, v]) => a + (v as number), 0)

    const total = grade10 + grade9 + grade8 + grade7 + grade6andBelow

    if (total === 0) return null

    return {
      total,
      byGrade: { grade10, grade9, grade8, grade7, grade6andBelow },
      probabilities: {
        psa10: Math.round((grade10 / total) * 100),
        psa9: Math.round((grade9 / total) * 100),
        psa8: Math.round((grade8 / total) * 100),
        psa7: Math.round(((grade7 + grade6andBelow) / total) * 100),
      },
      source: 'PSA Population Report'
    }
  } catch {
    return null
  }
}

// Probabilités par défaut basées sur les stats générales PSA
// Source : analyses de marché TCG investisseurs (données publiques agrégées)
export function getDefaultProbabilities(psaGrade: number, confidence: number): {
  psa10: number; psa9: number; psa8: number; psa7: number
} {
  const conf = confidence / 100

  if (psaGrade >= 9.5) return {
    psa10: Math.round(35 * conf),
    psa9: Math.round(40 * conf + 10 * (1 - conf)),
    psa8: Math.round(15 + 10 * (1 - conf)),
    psa7: Math.round(10 + 15 * (1 - conf)),
  }
  if (psaGrade >= 9) return {
    psa10: Math.round(15 * conf),
    psa9: Math.round(45 * conf + 15 * (1 - conf)),
    psa8: Math.round(25 + 5 * (1 - conf)),
    psa7: Math.round(15 + 20 * (1 - conf)),
  }
  if (psaGrade >= 8) return {
    psa10: Math.round(5 * conf),
    psa9: Math.round(20 * conf + 10 * (1 - conf)),
    psa8: Math.round(40 * conf + 15 * (1 - conf)),
    psa7: Math.round(35 + 20 * (1 - conf)),
  }
  return { psa10: 2, psa9: 10, psa8: 25, psa7: 63 }
}
