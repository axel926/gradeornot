// PokéTCG API - gratuit, pas besoin de clé pour commencer
const POKÉTCG_API = 'https://api.pokemontcg.io/v2'

// Scryfall API - gratuit, pas de clé nécessaire
const SCRYFALL_API = 'https://api.scryfall.com'

export interface CardPrice {
  name: string
  set: string
  image: string | null
  prices: {
    low: number | null
    mid: number | null
    high: number | null
    market: number | null
  }
  found: boolean
}

function extractPokemonPrice(card: any, version?: string): { low: number | null; mid: number | null; high: number | null; market: number | null } {
  const tcg = card.tcgplayer?.prices
  if (!tcg) return { low: null, mid: null, high: null, market: null }

  // Sélectionne le bon type de prix selon la version
  let priceData: any = null
  if (version?.toLowerCase().includes('1st') || version?.toLowerCase().includes('first')) {
    priceData = tcg['1stEditionHolofoil'] || tcg['1stEdition'] || tcg.holofoil || tcg.normal
  } else if (version?.toLowerCase().includes('reverse')) {
    priceData = tcg.reverseHolofoil || tcg.holofoil || tcg.normal
  } else {
    priceData = tcg.holofoil || tcg['unlimitedHolofoil'] || tcg.normal || tcg.reverseHolofoil || Object.values(tcg)[0]
  }

  if (!priceData) priceData = Object.values(tcg)[0] as any
  return {
    low: priceData?.low || null,
    mid: priceData?.mid || null,
    high: priceData?.high || null,
    market: priceData?.market || null,
  }
}

export async function getPokemonPrice(cardName: string, setName?: string, setNumber?: string, version?: string): Promise<CardPrice> {
  const headers = { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' }
  const empty: CardPrice = { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }

  try {
    // Stratégie 1 — match par numéro de carte (le plus précis)
    if (setNumber) {
      const num = setNumber.includes('/') ? setNumber.split('/')[0] : setNumber
      const query = setName
        ? `number:${num} set.name:"${setName}"`
        : `name:"${cardName}" number:${num}`
      const res = await fetch(`${POKÉTCG_API}/cards?q=${encodeURIComponent(query)}&pageSize=5`, { headers })
      const data = await res.json()
      if (data.data?.length > 0) {
        // Parmi les résultats, prend celui dont le nom matche le mieux
        const card = data.data.find((c: any) =>
          c.name.toLowerCase().includes(cardName.toLowerCase())
        ) || data.data[0]
        const prices = extractPokemonPrice(card, version)
        if (prices.market) {
          return { name: card.name, set: card.set?.name || '', image: card.images?.large || card.images?.small || null, prices, found: true }
        }
      }
    }

    // Stratégie 2 — match par nom + set
    if (setName) {
      const query = `name:"${cardName}" set.name:"${setName}"`
      const res = await fetch(`${POKÉTCG_API}/cards?q=${encodeURIComponent(query)}&pageSize=10`, { headers })
      const data = await res.json()
      if (data.data?.length > 0) {
        const card = data.data[0]
        const prices = extractPokemonPrice(card, version)
        if (prices.market) {
          return { name: card.name, set: card.set?.name || '', image: card.images?.large || card.images?.small || null, prices, found: true }
        }
      }
    }

    // Stratégie 3 — fallback nom seul, prend la carte avec le prix le plus élevé (= edition la plus valuable)
    const res3 = await fetch(`${POKÉTCG_API}/cards?q=${encodeURIComponent(`name:"${cardName}"`)}&pageSize=20`, { headers })
    const data3 = await res3.json()
    if (!data3.data?.length) return empty

    // Trie par prix market décroissant pour avoir la version la plus précieuse si on a un set en tête
    const cards = data3.data as any[]
    const withPrices = cards
      .map((c: any) => ({ card: c, prices: extractPokemonPrice(c, version) }))
      .filter(x => x.prices.market !== null)
      .sort((a, b) => (b.prices.market || 0) - (a.prices.market || 0))

    if (!withPrices.length) return empty

    // Si on a un setName partiel, essaie de matcher
    const best = setName
      ? withPrices.find(x => x.card.set?.name?.toLowerCase().includes(setName.toLowerCase().split(' ')[0])) || withPrices[0]
      : withPrices[0]

    return {
      name: best.card.name,
      set: best.card.set?.name || '',
      image: best.card.images?.large || best.card.images?.small || null,
      prices: best.prices,
      found: true
    }
  } catch {
    return empty
  }
}

export async function getMagicPrice(cardName: string, setName?: string): Promise<CardPrice> {
  try {
    const query = setName ? `!"${cardName}" e:${setName}` : `!"${cardName}"`
    const res = await fetch(
      `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(query)}&order=usd&dir=desc`,
    )
    const data = await res.json()

    if (!data.data || data.data.length === 0) {
      const res2 = await fetch(`${SCRYFALL_API}/cards/named?fuzzy=${encodeURIComponent(cardName)}`)
      const card = await res2.json()
      if (card.object === 'error') return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
      return {
        name: card.name,
        set: card.set_name || '',
        image: card.image_uris?.normal || null,
        prices: {
          low: card.prices?.usd ? parseFloat(card.prices.usd) * 0.8 : null,
          mid: card.prices?.usd ? parseFloat(card.prices.usd) : null,
          high: card.prices?.usd ? parseFloat(card.prices.usd) * 1.3 : null,
          market: card.prices?.usd ? parseFloat(card.prices.usd) : null,
        },
        found: true
      }
    }

    const card = data.data[0]
    return {
      name: card.name,
      set: card.set_name || '',
      image: card.image_uris?.normal || null,
      prices: {
        low: card.prices?.usd ? parseFloat(card.prices.usd) * 0.8 : null,
        mid: card.prices?.usd ? parseFloat(card.prices.usd) : null,
        high: card.prices?.usd ? parseFloat(card.prices.usd) * 1.3 : null,
        market: card.prices?.usd ? parseFloat(card.prices.usd) : null,
      },
      found: true
    }
  } catch {
    return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
  }
}

export async function getYugiohPrice(cardName: string): Promise<CardPrice> {
  try {
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`
    )
    const data = await res.json()
    const card = data?.data?.[0]
    if (!card) return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }

    const prices = card.card_prices?.[0]
    const tcg = prices?.tcgplayer_price ? parseFloat(prices.tcgplayer_price) : null
    const ebay = prices?.ebay_price ? parseFloat(prices.ebay_price) : null
    const market = tcg || ebay || null

    return {
      name: card.name,
      set: card.card_sets?.[0]?.set_name || '',
      image: card.card_images?.[0]?.image_url || null,
      prices: {
        low: market ? Math.round(market * 0.8 * 100) / 100 : null,
        mid: market,
        high: market ? Math.round(market * 1.3 * 100) / 100 : null,
        market,
      },
      found: !!market
    }
  } catch {
    return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
  }
}

export async function getLorcanaPrice(cardName: string): Promise<CardPrice> {
  try {
    const res = await fetch(
      `https://api.lorcast.com/v0/cards/search?q=${encodeURIComponent(cardName)}`
    )
    const data = await res.json()
    const card = data?.results?.[0]
    if (!card) return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }

    const market = card.prices?.usd ? parseFloat(card.prices.usd) : null

    return {
      name: card.name,
      set: card.set?.name || '',
      image: card.image?.uri || null,
      prices: {
        low: market ? Math.round(market * 0.8 * 100) / 100 : null,
        mid: market,
        high: market ? Math.round(market * 1.3 * 100) / 100 : null,
        market,
      },
      found: !!market
    }
  } catch {
    return { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
  }
}

export async function getCardPrice(cardName: string, game: string, setName?: string, setNumber?: string, version?: string): Promise<CardPrice> {
  const gameLower = game.toLowerCase()
  if (gameLower.includes('pokemon') || gameLower.includes('pokémon')) {
    return getPokemonPrice(cardName, setName, setNumber, version)
  }
  if (gameLower.includes('magic')) {
    return getMagicPrice(cardName, setName)
  }
  if (gameLower.includes('yu-gi-oh') || gameLower.includes('yugioh') || gameLower.includes('yu gi oh')) {
    return getYugiohPrice(cardName)
  }
  if (gameLower.includes('lorcana')) {
    return getLorcanaPrice(cardName)
  }
  // One Piece — pas d'API publique avec prix
  return { name: cardName, set: setName || '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
}
