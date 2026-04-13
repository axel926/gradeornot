export interface CardForBatch {
  id: string
  cardName: string
  game: string
  rawValue: number
  estimatedGrade: number
  gradedValues: { PSA10: number; PSA9: number; PSA8: number }
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
}

export interface BatchRecommendation {
  service: 'PSA' | 'BGS' | 'CGC'
  tier: string
  cost: number
  turnaround: string
  minValue: number
  cards: CardForBatch[]
  totalCost: number
  totalExpectedValue: number
  totalExpectedProfit: number
  totalROI: number
  reason: string
}

export interface BatchStrategy {
  recommendations: BatchRecommendation[]
  totalCards: number
  totalCost: number
  totalExpectedProfit: number
  savings: number
  advice: string[]
}

const SERVICES = {
  PSA: {
    tiers: [
      { name: 'Economy', cost: 25, turnaround: '100+ days', minValue: 0 },
      { name: 'Regular', cost: 50, turnaround: '60-120 days', minValue: 75 },
      { name: 'Express', cost: 150, turnaround: '10 days', minValue: 300 },
      { name: 'Super Express', cost: 500, turnaround: '2 days', minValue: 1000 },
    ],
    shippingBase: 20,
    shippingPerCard: 2,
    insurance: 0.015,
  },
  BGS: {
    tiers: [
      { name: 'Economy', cost: 22, turnaround: '90 days', minValue: 0 },
      { name: 'Regular', cost: 40, turnaround: '45 days', minValue: 50 },
      { name: 'Express', cost: 100, turnaround: '10 days', minValue: 200 },
    ],
    shippingBase: 20,
    shippingPerCard: 2,
    insurance: 0.015,
  },
  CGC: {
    tiers: [
      { name: 'Economy', cost: 12, turnaround: '60-80 days', minValue: 0 },
      { name: 'Regular', cost: 25, turnaround: '30-45 days', minValue: 0 },
      { name: 'Express', cost: 50, turnaround: '10 days', minValue: 100 },
    ],
    shippingBase: 15,
    shippingPerCard: 1.5,
    insurance: 0.01,
  },
}

function getBestTierForCard(
  service: keyof typeof SERVICES,
  card: CardForBatch
): typeof SERVICES.PSA.tiers[0] {
  const tiers = SERVICES[service].tiers
  // Prendre le tier le moins cher qui correspond à la valeur de la carte
  const eligible = tiers.filter(t => card.rawValue >= t.minValue)
  return eligible[0] || tiers[0]
}

function calcExpectedValue(card: CardForBatch): number {
  return (
    card.gradedValues.PSA10 * card.gradeProbabilities.psa10 / 100 +
    card.gradedValues.PSA9 * card.gradeProbabilities.psa9 / 100 +
    card.gradedValues.PSA8 * card.gradeProbabilities.psa8 / 100 +
    card.rawValue * 0.85 * card.gradeProbabilities.psa7 / 100
  )
}

export function buildBatchStrategy(cards: CardForBatch[]): BatchStrategy {
  if (cards.length === 0) return {
    recommendations: [], totalCards: 0, totalCost: 0,
    totalExpectedProfit: 0, savings: 0, advice: []
  }

  // Grouper les cartes par service optimal
  const groups: Record<string, CardForBatch[]> = { PSA: [], BGS: [], CGC: [] }

  for (const card of cards) {
    // Logique de routing par service
    if (card.rawValue >= 200) {
      // Cartes premium → PSA (meilleure reconnaissance marché)
      groups.PSA.push(card)
    } else if (card.estimatedGrade >= 9.5) {
      // Cartes potentiellement parfaites → BGS (subgrades valorisées)
      groups.BGS.push(card)
    } else if (card.rawValue < 50) {
      // Petites valeurs → CGC (moins cher)
      groups.CGC.push(card)
    } else {
      // Milieu de gamme → PSA (liquidité)
      groups.PSA.push(card)
    }
  }

  const recommendations: BatchRecommendation[] = []

  for (const [serviceName, serviceCards] of Object.entries(groups)) {
    if (serviceCards.length === 0) continue

    const service = serviceName as keyof typeof SERVICES
    const config = SERVICES[service]

    // Tier optimal pour le batch (basé sur la carte la plus chère)
    const maxValue = Math.max(...serviceCards.map(c => c.rawValue))
    const batchTier = getBestTierForCard(service, { rawValue: maxValue } as CardForBatch)

    // Coûts batch
    const gradingCost = serviceCards.length * batchTier.cost
    const shippingCost = config.shippingBase + (serviceCards.length * config.shippingPerCard)
    const insuranceCost = Math.round(maxValue * config.insurance * 100) / 100
    const totalCost = gradingCost + shippingCost + insuranceCost

    // Valeur attendue
    const totalExpectedValue = serviceCards.reduce((a, c) => a + calcExpectedValue(c), 0)
    const totalRawValue = serviceCards.reduce((a, c) => a + c.rawValue, 0)
    const netExpected = totalExpectedValue * 0.8725 // après 13.25% frais vente
    const totalExpectedProfit = Math.round(netExpected - totalRawValue - totalCost)
    const totalROI = totalRawValue > 0 ? Math.round(((totalExpectedProfit) / (totalRawValue + totalCost)) * 100) : 0

    // Raison
    const reason = service === 'PSA'
      ? `PSA offers the highest market liquidity and resale value for ${serviceCards.length > 1 ? 'these cards' : 'this card'}`
      : service === 'BGS'
      ? `BGS subgrades add premium value for near-perfect cards`
      : `CGC offers the best cost-to-value ratio for lower-value cards`

    recommendations.push({
      service,
      tier: batchTier.name,
      cost: batchTier.cost,
      turnaround: batchTier.turnaround,
      minValue: batchTier.minValue,
      cards: serviceCards,
      totalCost,
      totalExpectedValue: Math.round(totalExpectedValue),
      totalExpectedProfit,
      totalROI,
      reason,
    })
  }

  // Savings vs envoi individuel
  const individualCost = cards.reduce((a, c) => {
    const service = c.rawValue >= 200 ? 'PSA' : c.rawValue < 50 ? 'CGC' : 'PSA'
    return a + SERVICES[service].shippingBase + getBestTierForCard(service as keyof typeof SERVICES, c).cost
  }, 0)
  const batchCost = recommendations.reduce((a, r) => a + r.totalCost, 0)
  const savings = Math.max(0, Math.round(individualCost - batchCost))

  // Conseils
  const advice: string[] = []
  if (savings > 0) advice.push(`Sending ${cards.length} cards together saves ~$${savings} in shipping vs individual submissions`)
  if (groups.PSA.length > 20) advice.push('With 20+ cards, consider PSA bulk submission for additional discounts')
  const lowValueCards = cards.filter(c => c.rawValue < 30)
  if (lowValueCards.length > 0) advice.push(`${lowValueCards.length} card${lowValueCards.length > 1 ? 's' : ''} under $30 raw — grading fees may exceed potential upside`)
  const highGradeCards = cards.filter(c => c.estimatedGrade >= 9)
  if (highGradeCards.length > 0) advice.push(`${highGradeCards.length} card${highGradeCards.length > 1 ? 's' : ''} estimated PSA 9+ — prioritize these in your submission`)

  return {
    recommendations,
    totalCards: cards.length,
    totalCost: batchCost,
    totalExpectedProfit: recommendations.reduce((a, r) => a + r.totalExpectedProfit, 0),
    savings,
    advice,
  }
}
