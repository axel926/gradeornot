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

// Mapping set name → set ID pour match précis
const SET_NAME_TO_ID: Record<string, string> = {
  'base set': 'base1', 'base': 'base1',
  'jungle': 'base2',
  'fossil': 'base3',
  'base set 2': 'base4',
  'team rocket': 'base5',
  'gym heroes': 'gym1',
  'gym challenge': 'gym2',
  'neo genesis': 'neo1',
  'neo discovery': 'neo2',
  'neo revelation': 'neo3',
  'neo destiny': 'neo4',
  'expedition': 'ecard1', 'expedition base set': 'ecard1',
  'aquapolis': 'ecard2',
  'skyridge': 'ecard3',
  'evolutions': 'xy12', 'xy evolutions': 'xy12',
  'breakthrough': 'xy8', 'breakpoint': 'xy9',
  'fates collide': 'xy10', 'steam siege': 'xy11',
  'roaring skies': 'xy6', 'ancient origins': 'xy7',
  'flashfire': 'xy2', 'furious fists': 'xy3',
  'phantom forces': 'xy4', 'primal clash': 'xy5',
  'kalos starter set': 'xy0', 'xy': 'xy1',
  'black & white': 'bw1', 'emerging powers': 'bw2',
  'noble victories': 'bw3', 'next destinies': 'bw4',
  'dark explorers': 'bw5', 'dragons exalted': 'bw6',
  'boundaries crossed': 'bw7', 'plasma storm': 'bw8',
  'plasma freeze': 'bw9', 'plasma blast': 'bw10',
  'legendary treasures': 'bw11',
  'sun & moon': 'sm1', 'guardians rising': 'sm2',
  'burning shadows': 'sm3', 'crimson invasion': 'sm4',
  'ultra prism': 'sm5', 'forbidden light': 'sm6',
  'celestial storm': 'sm7', 'lost thunder': 'sm8',
  'team up': 'sm9', 'unbroken bonds': 'sm10',
  'unified minds': 'sm11', 'cosmic eclipse': 'sm12',
  'sword & shield': 'swsh1', 'rebel clash': 'swsh2',
  'darkness ablaze': 'swsh3', 'vivid voltage': 'swsh4',
  'battle styles': 'swsh5', 'chilling reign': 'swsh6',
  'evolving skies': 'swsh7', 'fusion strike': 'swsh8',
  'brilliant stars': 'swsh9', 'astral radiance': 'swsh10',
  'lost origin': 'swsh11', 'silver tempest': 'swsh12',
  'scarlet & violet': 'sv1', 'paldea evolved': 'sv2',
  'obsidian flames': 'sv3', 'paradox rift': 'sv4',
  'temporal forces': 'sv5', 'twilight masquerade': 'sv6',
  'shrouded fable': 'sv7', 'stellar crown': 'sv8',
  'legendary collection': 'base6',
  'southern islands': 'si1',
}

function cleanSetName(setName: string): string {
  return setName
    .replace(/\(french\)/gi, '').replace(/\(japanese\)/gi, '')
    .replace(/\(german\)/gi, '').replace(/\(spanish\)/gi, '')
    .replace(/\(italian\)/gi, '').replace(/\(portuguese\)/gi, '')
    .trim()
}

export async function getPokemonPrice(cardName: string, setName?: string, setNumber?: string, version?: string): Promise<CardPrice> {
  const headers = { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' }
  const empty: CardPrice = { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }

  const cleanedSetName = setName ? cleanSetName(setName) : undefined
  const setId = cleanedSetName ? SET_NAME_TO_ID[cleanedSetName.toLowerCase()] : undefined

  try {
    // Stratégie 1 — match par numéro de carte (le plus précis)
    if (setNumber) {
      const num = setNumber.includes('/') ? setNumber.split('/')[0] : setNumber
      const query = setId
        ? `number:${num} set.id:${setId}`
        : cleanedSetName
        ? `number:${num} set.name:"${cleanedSetName}"`
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
    if (cleanedSetName) {
      const query = setId
        ? `name:"${cardName}" set.id:${setId}`
        : `name:"${cardName}" set.name:"${cleanedSetName}"`
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

export async function getTCGAPIPrice(cardName: string, gameSlug: string, setName?: string, setNumber?: string): Promise<CardPrice> {
  const empty: CardPrice = { name: cardName, set: '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
  try {
    const apiKey = process.env.TCGAPI_KEY
    if (!apiKey) return empty

    const q = encodeURIComponent(cardName)
    const res = await fetch(
      `https://api.tcgapi.dev/v1/search?q=${q}&game_slug=${gameSlug}&limit=20`,
      { headers: { 'x-api-key': apiKey } }
    )
    if (!res.ok) return empty
    const data = await res.json()
    const cards = data?.data || []
    if (!cards.length) return empty

    // Filtre par numéro de carte si dispo
    let card = null
    if (setNumber) {
      const num = setNumber.includes('/') ? setNumber.split('/')[0].padStart(3, '0') : setNumber
      card = cards.find((c: any) =>
        c.number?.includes(num) || c.number === setNumber
      )
    }

    // Filtre par set si dispo
    if (!card && setName) {
      const cleanSet = setName.replace(/\(french\)/gi, '').replace(/\(japanese\)/gi, '').trim().toLowerCase()
      card = cards.find((c: any) =>
        c.set_name?.toLowerCase().includes(cleanSet) ||
        cleanSet.includes(c.set_name?.toLowerCase())
      )
    }

    // Filtre par version (holo vs normal)
    if (!card) {
      card = cards.find((c: any) => c.market_price != null && c.total_listings > 5) || cards[0]
    }

    if (!card || !card.market_price) return empty

    return {
      name: card.name,
      set: card.set_name || '',
      image: card.image_url || null,
      prices: {
        low: card.low_price || null,
        mid: card.median_price || card.market_price || null,
        high: null,
        market: card.market_price || null,
      },
      found: true
    }
  } catch {
    return empty
  }
}

export async function getCardPrice(cardName: string, game: string, setName?: string, setNumber?: string, version?: string): Promise<CardPrice> {
  const gameLower = game.toLowerCase()

  // TCG API — source universelle avec vrais prix TCGPlayer
  const gameSlugMap: Record<string, string> = {
    'pokemon': 'pokemon',
    'pokémon': 'pokemon',
    'magic': 'magic',
    'magic: the gathering': 'magic',
    'yu-gi-oh': 'yugioh',
    'yugioh': 'yugioh',
    'yu gi oh': 'yugioh',
    'one piece': 'one-piece-card-game',
    'one piece card game': 'one-piece-card-game',
    'lorcana': 'lorcana-tcg',
    'disney lorcana': 'lorcana-tcg',
  }

  const gameSlug = Object.entries(gameSlugMap).find(([key]) => gameLower.includes(key))?.[1]

  if (gameSlug) {
    const tcgResult = await getTCGAPIPrice(cardName, gameSlug, setName, setNumber)
    if (tcgResult.found) return tcgResult

    // Fallback APIs pour Pokemon et Magic
    if (gameLower.includes('pokemon') || gameLower.includes('pokémon')) {
      return getPokemonPrice(cardName, setName, setNumber, version)
    }
    if (gameLower.includes('magic')) {
      return getMagicPrice(cardName, setName)
    }
  }

  return { name: cardName, set: setName || '', image: null, prices: { low: null, mid: null, high: null, market: null }, found: false }
}
