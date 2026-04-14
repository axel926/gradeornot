export interface InvestmentScore {
  total: number
  label: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'AVOID'
  color: string
  breakdown: {
    roi: number
    risk: number
    liquidity: number
    grade: number
    value: number
  }
  advice: string
}

interface ScoreInput {
  roi: number
  netProfit: number
  psaGrade: number
  rawValue: number
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
  volume?: { days7: number; days30: number }
  psaPopulation?: { total: number } | null
}

export function calculateInvestmentScore(input: ScoreInput): InvestmentScore {
  const { roi, netProfit, psaGrade, rawValue, gradeProbabilities, volume, psaPopulation } = input

  // 1. ROI Score (30 pts)
  const roiScore = roi >= 100 ? 30
    : roi >= 50 ? 25
    : roi >= 30 ? 20
    : roi >= 15 ? 12
    : roi >= 0 ? 5
    : 0

  // 2. Risk Score (25 pts) — basé sur la probabilité de mauvais grade
  const downside = gradeProbabilities.psa7
  const riskScore = downside <= 10 ? 25
    : downside <= 20 ? 20
    : downside <= 35 ? 14
    : downside <= 50 ? 8
    : 3

  // 3. Liquidity Score (20 pts)
  const vol7 = volume?.days7 || 0
  const liquidityScore = vol7 >= 20 ? 20
    : vol7 >= 10 ? 16
    : vol7 >= 5 ? 12
    : vol7 >= 1 ? 7
    : 4 // pas de data = score neutre

  // 4. Grade Score (15 pts) — qualité estimée de la carte
  const gradeScore = psaGrade >= 9.5 ? 15
    : psaGrade >= 9 ? 12
    : psaGrade >= 8.5 ? 9
    : psaGrade >= 8 ? 6
    : psaGrade >= 7 ? 3
    : 1

  // 5. Value Score (10 pts) — valeur brute suffisante
  const valueScore = rawValue >= 500 ? 10
    : rawValue >= 200 ? 8
    : rawValue >= 100 ? 6
    : rawValue >= 50 ? 4
    : rawValue >= 15 ? 2
    : 0

  const total = roiScore + riskScore + liquidityScore + gradeScore + valueScore

  const label = total >= 80 ? 'EXCELLENT'
    : total >= 65 ? 'GOOD'
    : total >= 45 ? 'AVERAGE'
    : total >= 25 ? 'POOR'
    : 'AVOID'

  const color = label === 'EXCELLENT' ? '#22C55E'
    : label === 'GOOD' ? '#86EFAC'
    : label === 'AVERAGE' ? '#F5B731'
    : label === 'POOR' ? '#F97316'
    : '#EF4444'

  const advice = label === 'EXCELLENT' ? 'Strong investment opportunity — all indicators positive'
    : label === 'GOOD' ? 'Good opportunity with manageable risk'
    : label === 'AVERAGE' ? 'Marginal — consider waiting for better conditions'
    : label === 'POOR' ? 'High risk, low reward — think twice'
    : 'Not worth grading at current market conditions'

  return {
    total,
    label,
    color,
    breakdown: {
      roi: roiScore,
      risk: riskScore,
      liquidity: liquidityScore,
      grade: gradeScore,
      value: valueScore,
    },
    advice,
  }
}
