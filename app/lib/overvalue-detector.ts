// Ce fichier détecte quand une carte est surcotée
// Logique : on compare le prix actuel à la moyenne historique
// Si le prix actuel est 25%+ au-dessus de la moyenne → surcote détectée

export interface OvervalueResult {
  isOvervalued: boolean
  currentPrice: number
  historicalAvg: number
  deviation: number // en pourcentage
  signal: 'OVERVALUED' | 'FAIR' | 'UNDERVALUED'
  color: string
  advice: string
}

export function detectOvervalue(
  currentPrice: number,
  historicalPrices: number[]
): OvervalueResult {
  if (historicalPrices.length === 0) {
    return {
      isOvervalued: false,
      currentPrice,
      historicalAvg: currentPrice,
      deviation: 0,
      signal: 'FAIR',
      color: '#888',
      advice: 'Not enough historical data to detect overvaluation'
    }
  }

  // Moyenne historique — on retire les outliers d'abord
  const sorted = [...historicalPrices].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const clean = sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
  const avg = clean.reduce((a, b) => a + b, 0) / clean.length

  // Déviation = (prix actuel - moyenne) / moyenne × 100
  const deviation = Math.round(((currentPrice - avg) / avg) * 100 * 10) / 10

  let signal: 'OVERVALUED' | 'FAIR' | 'UNDERVALUED'
  let color: string
  let advice: string

  if (deviation >= 25) {
    signal = 'OVERVALUED'
    color = '#EF4444'
    advice = `Price is ${deviation}% above historical average — consider waiting for a correction before buying`
  } else if (deviation <= -20) {
    signal = 'UNDERVALUED'
    color = '#22C55E'
    advice = `Price is ${Math.abs(deviation)}% below historical average — potential buying opportunity`
  } else {
    signal = 'FAIR'
    color = '#F5B731'
    advice = `Price is within normal range (${deviation >= 0 ? '+' : ''}${deviation}% vs avg)`
  }

  return {
    isOvervalued: signal === 'OVERVALUED',
    currentPrice,
    historicalAvg: Math.round(avg * 100) / 100,
    deviation,
    signal,
    color,
    advice
  }
}
