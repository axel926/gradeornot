// Ce fichier détecte automatiquement les cartes intéressantes à grader
// Logique : on cherche des cartes avec un fort ratio PSA10/RAW et un bon volume

const WATCHLIST = [
  // Pokémon classiques
  { name: 'Charizard', set: 'Base Set', game: 'Pokemon' },
  { name: 'Blastoise', set: 'Base Set', game: 'Pokemon' },
  { name: 'Venusaur', set: 'Base Set', game: 'Pokemon' },
  { name: 'Pikachu', set: 'Base Set', game: 'Pokemon' },
  { name: 'Mewtwo', set: 'Base Set', game: 'Pokemon' },
  // Modernes
  { name: 'Charizard VSTAR', set: 'Brilliant Stars', game: 'Pokemon' },
  { name: 'Umbreon VMAX', set: 'Evolving Skies', game: 'Pokemon' },
  { name: 'Rayquaza VMAX', set: 'Evolving Skies', game: 'Pokemon' },
  { name: 'Charizard ex', set: 'Obsidian Flames', game: 'Pokemon' },
  { name: 'Lugia V', set: 'Silver Tempest', game: 'Pokemon' },
]

interface Opportunity {
  cardName: string
  game: string
  setName: string
  rawValue: number
  psa10Value: number
  estimatedROI: number
  investmentScore: number
  reason: string
}

async function fetchCardData(cardName: string, setName: string) {
  try {
    const query = `name:"${cardName}" set.name:"${setName}"`
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=1`,
      {
        headers: { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' },
        next: { revalidate: 3600 }
      }
    )
    const data = await res.json()
    const card = data.data?.[0]
    if (!card?.tcgplayer?.prices) return null

    const prices = card.tcgplayer.prices
    const priceObj = prices.holofoil || prices.normal || Object.values(prices)[0] as Record<string, number>
    const rawValue = (priceObj as Record<string, number>).market || (priceObj as Record<string, number>).mid || 0

    return { rawValue, card }
  } catch {
    return null
  }
}

function calculateROI(rawValue: number, psa10Value: number) {
  // Coûts fixes : grading PSA regular + shipping
  const gradingCost = 50
  const shippingCost = 40
  const totalCost = rawValue + gradingCost + shippingCost
  // On assume 15% de PSA 10 et on vend sur eBay (13.25% de frais)
  const expectedValue = psa10Value * 0.15 + (rawValue * 1.5) * 0.85
  const netProceeds = expectedValue * 0.8725
  const roi = ((netProceeds - totalCost) / totalCost) * 100
  return Math.round(roi * 10) / 10
}

export async function detectOpportunities(): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = []

  // On analyse chaque carte de la watchlist en parallèle
  const results = await Promise.all(
    WATCHLIST.map(async (card) => {
      const data = await fetchCardData(card.name, card.set)
      if (!data || !data.rawValue) return null

      const rawValue = data.rawValue
      // Multiplicateurs PSA réalistes basés sur les données de marché
      const psa10Multiplier = rawValue < 20 ? 8
        : rawValue < 50 ? 6
        : rawValue < 100 ? 5
        : rawValue < 200 ? 4
        : 3.5
      const psa10Value = Math.round(rawValue * psa10Multiplier * 100) / 100

      const roi = calculateROI(rawValue, psa10Value)

      // Score d'investissement simplifié
      const score = roi >= 50 ? 85
        : roi >= 30 ? 70
        : roi >= 15 ? 55
        : roi >= 0 ? 40
        : 20

      // On ne garde que les opportunités avec ROI > 15%
      if (roi < 15) return null

      // Raison humaine
      const reason = roi >= 50
        ? `Strong PSA 10 multiplier (×${psa10Multiplier}) with low raw price — high upside`
        : roi >= 30
        ? `Good ROI potential with current market pricing`
        : `Moderate opportunity — worth monitoring`

      return {
        cardName: card.name,
        game: card.game,
        setName: card.set,
        rawValue,
        psa10Value,
        estimatedROI: roi,
        investmentScore: score,
        reason,
      }
    })
  )

  // Filtrer les null et trier par ROI décroissant
  return (results.filter(r => r !== null) as Opportunity[])
    .sort((a, b) => b.estimatedROI - a.estimatedROI)
    .slice(0, 5)
}

// Sauvegarde les opportunités dans Supabase
export async function saveOpportunities() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const opps = await detectOpportunities()

  // On supprime les anciennes et on insère les nouvelles
  await supabase.from('opportunities').delete().lt('expires_at', new Date().toISOString())

  if (opps.length > 0) {
    await supabase.from('opportunities').insert(
      opps.map(o => ({
        card_name: o.cardName,
        game: o.game,
        set_name: o.setName,
        raw_value: o.rawValue,
        psa10_value: o.psa10Value,
        estimated_roi: o.estimatedROI,
        investment_score: o.investmentScore,
        reason: o.reason,
      }))
    )
  }

  return opps
}
