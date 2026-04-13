export interface TCGCard {
  id: string
  name: string
  setName: string
  setCode: string
  number: string
  year: string
  rarity: string
  types: string[]
  hp: string | null
  artist: string | null
  imageUrl: string | null
  tcgplayerId: string | null
  game: string
}

export interface CardMatch {
  card: TCGCard
  confidence: number
  matchedBy: string[]
}

export async function searchPokemonCard(
  cardName: string,
  setNumber?: string,
  setName?: string,
  year?: string
): Promise<CardMatch[]> {
  try {
    let query = `name:"${cardName}"`
    if (setNumber) query += ` number:${setNumber}`
    if (setName) query += ` set.name:"${setName}"`

    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&orderBy=-set.releaseDate&pageSize=10`,
      {
        headers: { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' },
        next: { revalidate: 86400 }
      }
    )

    if (!res.ok) return []
    const data = await res.json()
    if (!data.data || data.data.length === 0) return []

    return data.data.map((card: Record<string, unknown>) => {
      const matchedBy: string[] = ['name']
      let confidence = 60

      // Boost confidence si numéro de série correspond
      if (setNumber && (card.number as string) === setNumber) {
        matchedBy.push('set_number')
        confidence += 25
      }

      // Boost si set correspond
      if (setName && (card.set as Record<string, string>)?.name?.toLowerCase().includes(setName.toLowerCase())) {
        matchedBy.push('set_name')
        confidence += 10
      }

      // Boost si année correspond
      const cardYear = new Date((card.set as Record<string, string>)?.releaseDate || '').getFullYear().toString()
      if (year && cardYear === year) {
        matchedBy.push('year')
        confidence += 5
      }

      return {
        card: {
          id: card.id as string,
          name: card.name as string,
          setName: (card.set as Record<string, string>)?.name || '',
          setCode: (card.set as Record<string, string>)?.id || '',
          number: card.number as string,
          year: cardYear,
          rarity: card.rarity as string || '',
          types: (card.types as string[]) || [],
          hp: card.hp as string || null,
          artist: card.artist as string || null,
          imageUrl: (card.images as Record<string, string>)?.large || null,
          tcgplayerId: (card.tcgplayer as Record<string, string>)?.url || null,
          game: 'Pokemon',
        },
        confidence: Math.min(confidence, 99),
        matchedBy,
      }
    }).sort((a: CardMatch, b: CardMatch) => b.confidence - a.confidence)
  } catch {
    return []
  }
}

export async function searchMagicCard(
  cardName: string,
  setCode?: string,
  collectorNumber?: string
): Promise<CardMatch[]> {
  try {
    let url = `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}"`
    if (setCode) url += `+e:${setCode}`
    if (collectorNumber) url += `+cn:${collectorNumber}`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const data = await res.json()
    if (!data.data) return []

    return data.data.slice(0, 5).map((card: Record<string, unknown>) => ({
      card: {
        id: card.id as string,
        name: card.name as string,
        setName: card.set_name as string,
        setCode: card.set as string,
        number: card.collector_number as string,
        year: new Date(card.released_at as string).getFullYear().toString(),
        rarity: card.rarity as string,
        types: (card.type_line as string)?.split(' — ') || [],
        hp: null,
        artist: card.artist as string || null,
        imageUrl: (card.image_uris as Record<string, string>)?.large || null,
        tcgplayerId: null,
        game: 'Magic: The Gathering',
      },
      confidence: collectorNumber ? 95 : 70,
      matchedBy: collectorNumber ? ['name', 'collector_number'] : ['name'],
    }))
  } catch {
    return []
  }
}

export async function validateCardIdentification(
  game: string,
  cardName: string,
  setNumber?: string,
  setName?: string,
  year?: string
): Promise<{ validated: boolean; matches: CardMatch[]; bestMatch: CardMatch | null; needsConfirmation: boolean }> {
  let matches: CardMatch[] = []

  if (game.toLowerCase().includes('pokemon')) {
    matches = await searchPokemonCard(cardName, setNumber, setName, year)
  } else if (game.toLowerCase().includes('magic')) {
    matches = await searchMagicCard(cardName, undefined, setNumber)
  }

  if (matches.length === 0) {
    return { validated: false, matches: [], bestMatch: null, needsConfirmation: true }
  }

  const bestMatch = matches[0]
  const validated = bestMatch.confidence >= 85
  const needsConfirmation = !validated || matches.length > 1 && matches[1].confidence > 70

  return { validated, matches, bestMatch, needsConfirmation }
}
