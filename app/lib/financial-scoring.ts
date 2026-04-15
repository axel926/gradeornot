// Scoring financier avancé pour les investisseurs TCG
// Combine volatilité, liquidité et ROI en un score global

export interface FinancialScore {
  riskScore: number      // 0-100, plus bas = moins risqué
  liquidityScore: number // 0-100, plus haut = plus liquide
  volatilityScore: number // 0-100, plus bas = moins volatile
  investmentScore: number // 0-100, score global
  riskLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH'
  liquidityLabel: 'HIGH' | 'MEDIUM' | 'LOW'
  advice: string
}

interface FinancialInput {
  rawValue: number
  psa10Value: number
  roi: number
  volume7d: number
  volume30d: number
  trend7d: number | null
  trend30d: number | null
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
}

export function calculateFinancialScore(input: FinancialInput): FinancialScore {
  const { rawValue, psa10Value, roi, volume7d, volume30d, trend7d, trend30d, gradeProbabilities } = input

  // 1. RISK SCORE — basé sur la probabilité de mauvais grade et la valeur
  // Plus la carte est chère et plus le downside est grand → plus risqué
  const downside = gradeProbabilities.psa7 // % de chances d'avoir PSA 7 ou moins
  const valueRisk = rawValue < 20 ? 80  // trop peu de valeur = risque élevé
    : rawValue < 50 ? 60
    : rawValue < 100 ? 40
    : rawValue < 300 ? 25
    : 15

  const riskScore = Math.round((downside * 0.6) + (valueRisk * 0.4))
  const riskLabel = riskScore >= 70 ? 'VERY HIGH'
    : riskScore >= 50 ? 'HIGH'
    : riskScore >= 30 ? 'MEDIUM'
    : 'LOW'

  // 2. LIQUIDITY SCORE — basé sur le volume de ventes
  // Plus il y a de ventes, plus c'est facile de revendre
  const liquidityScore = volume7d >= 20 ? 90
    : volume7d >= 10 ? 75
    : volume7d >= 5 ? 55
    : volume7d >= 1 ? 35
    : 20 // pas de data = liquidité inconnue, on reste prudent

  const liquidityLabel = liquidityScore >= 65 ? 'HIGH'
    : liquidityScore >= 40 ? 'MEDIUM'
    : 'LOW'

  // 3. VOLATILITY SCORE — basé sur les tendances de prix
  // Une forte variation = volatile = risqué mais opportunité
  let volatilityScore = 50 // neutre par défaut
  if (trend7d !== null) {
    volatilityScore = Math.min(100, Math.abs(trend7d) * 3)
  }

  // 4. INVESTMENT SCORE GLOBAL
  // Formule : ROI positif + faible risque + bonne liquidité = bon score
  const roiComponent = roi >= 50 ? 35
    : roi >= 30 ? 28
    : roi >= 15 ? 18
    : roi >= 0 ? 8
    : 0

  const riskComponent = riskScore <= 20 ? 30
    : riskScore <= 40 ? 22
    : riskScore <= 60 ? 14
    : 5

  const liquidityComponent = liquidityScore >= 65 ? 20
    : liquidityScore >= 40 ? 13
    : 6

  const multiplierComponent = psa10Value > 0 && rawValue > 0
    ? Math.min(15, Math.round((psa10Value / rawValue) * 2))
    : 0

  const investmentScore = Math.min(100, roiComponent + riskComponent + liquidityComponent + multiplierComponent)

  // Conseil personnalisé
  const advice = investmentScore >= 75 ? 'Strong opportunity — low risk, high upside, good liquidity'
    : investmentScore >= 55 ? 'Good opportunity with manageable risk'
    : investmentScore >= 35 ? 'Moderate — monitor before committing'
    : riskLabel === 'VERY HIGH' ? 'High risk — grading may not justify the uncertainty'
    : liquidityLabel === 'LOW' ? 'Low liquidity — may be hard to sell after grading'
    : 'Weak opportunity at current market conditions'

  return { riskScore, liquidityScore, volatilityScore, investmentScore, riskLabel, liquidityLabel, advice }
}
