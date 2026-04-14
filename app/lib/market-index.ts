// Ce fichier calcule un "indice boursier" pour le marché TCG
// Comme le CAC40 mais pour les cartes

// Liste de cartes "clés" qui représentent bien le marché
const POKEMON_KEY_CARDS = [
  { name: 'Charizard', set: 'Base Set' },
  { name: 'Pikachu', set: 'Base Set' },
  { name: 'Blastoise', set: 'Base Set' },
  { name: 'Mewtwo', set: 'Base Set' },
  { name: 'Charizard VSTAR', set: 'Brilliant Stars' },
]

const MAGIC_KEY_CARDS = [
  { name: 'Black Lotus' },
  { name: 'Mox Pearl' },
  { name: 'Underground Sea' },
]

// Cette fonction va chercher le prix d'une carte Pokémon
async function getPokemonPrice(cardName: string, setName: string): Promise<number | null> {
  try {
    const query = `name:"${cardName}" set.name:"${setName}"`
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=1`,
      { headers: { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' }, next: { revalidate: 3600 } }
    )
    const data = await res.json()
    const card = data.data?.[0]
    if (!card?.tcgplayer?.prices) return null
    
    // On prend le prix "market" ou "mid" — le plus représentatif
    const prices = card.tcgplayer.prices
    const priceObj = prices.holofoil || prices.normal || Object.values(prices)[0] as Record<string, number>
    return (priceObj as Record<string, number>).market || (priceObj as Record<string, number>).mid || null
  } catch {
    return null
  }
}

// Cette fonction calcule la moyenne des prix — l'index
export async function calculateMarketIndex() {
  // On va chercher tous les prix en parallèle (en même temps)
  const pokemonPrices = await Promise.all(
    POKEMON_KEY_CARDS.map(c => getPokemonPrice(c.name, c.set))
  )

  // On filtre les null (cartes non trouvées) et on fait la moyenne
  const validPokemonPrices = pokemonPrices.filter(p => p !== null) as number[]
  const pokemonIndex = validPokemonPrices.length > 0
    ? Math.round(validPokemonPrices.reduce((a, b) => a + b, 0) / validPokemonPrices.length * 100) / 100
    : null

  // Index global = moyenne pondérée (Pokémon pèse plus car plus de data)
  const globalIndex = pokemonIndex
    ? Math.round(pokemonIndex * 100) / 100
    : null

  return {
    pokemon: pokemonIndex,
    magic: null, // on ajoutera Magic plus tard
    global: globalIndex,
    calculatedAt: new Date().toISOString(),
    sampleSize: validPokemonPrices.length,
  }
}

// Sauvegarde l'index dans Supabase pour construire l'historique
export async function saveMarketIndex() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const index = await calculateMarketIndex()
  if (!index.global) return null

  // Récupérer l'index d'il y a 7 jours pour calculer la variation
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: oldIndex } = await supabase
    .from('market_index')
    .select('global_index')
    .lt('recorded_at', sevenDaysAgo)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  // variation = ((nouveau - ancien) / ancien) * 100
  const variation7d = oldIndex?.global_index
    ? Math.round(((index.global - oldIndex.global_index) / oldIndex.global_index) * 100 * 10) / 10
    : null

  await supabase.from('market_index').insert({
    pokemon_index: index.pokemon,
    global_index: index.global,
    variation_7d: variation7d,
  })

  return { ...index, variation7d }
}
