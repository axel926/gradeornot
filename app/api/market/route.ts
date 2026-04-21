import { NextRequest, NextResponse } from 'next/server'
import { getMarketData } from '../../lib/market'
import { getEbaySoldListings } from '../../lib/ebay'
import { getCardmarketData } from '../../lib/cardmarket'

const FR_TO_EN: Record<string, string> = {
  'dracaufeu': 'charizard', 'bulbizarre': 'bulbasaur', 'herbizarre': 'ivysaur', 'florizarre': 'venusaur',
  'salamèche': 'charmander', 'reptincel': 'charmeleon', 'carapuce': 'squirtle', 'carabaffe': 'wartortle',
  'tortank': 'blastoise', 'chenipan': 'caterpie', 'chrysacier': 'metapod', 'papilusion': 'butterfree',
  'aspicot': 'weedle', 'coconfort': 'kakuna', 'dardargnan': 'beedrill', 'roucool': 'pidgey',
  'roucoups': 'pidgeotto', 'roucarnage': 'pidgeot', 'rattata': 'rattata', 'rattatac': 'raticate',
  'piafabec': 'spearow', 'rapasdepic': 'fearow', 'abo': 'ekans', 'arbok': 'arbok',
  'pikachu': 'pikachu', 'raichu': 'raichu', 'sabelette': 'sandshrew', 'sablaireau': 'sandslash',
  'nidoran': 'nidoran', 'nidorina': 'nidorina', 'nidoqueen': 'nidoqueen', 'nidorino': 'nidorino',
  'nidoking': 'nidoking', 'mélofée': 'clefairy', 'mélodelfe': 'clefable', 'goupix': 'vulpix',
  'feunard': 'ninetales', 'rondoudou': 'jigglypuff', 'grodoudou': 'wigglytuff', 'nosferapti': 'zubat',
  'nosferalto': 'golbat', 'mystherbe': 'oddish', 'ortide': 'gloom', 'rafflesia': 'vileplume',
  'paras': 'paras', 'parasect': 'parasect', 'mimitoss': 'venonat', 'aéromite': 'venomoth',
  'taupiqueur': 'diglett', 'triopikeur': 'dugtrio', 'miaouss': 'meowth', 'persian': 'persian',
  'psykokwak': 'psyduck', 'akwakwak': 'golduck', 'férosinge': 'mankey', 'colossinge': 'primeape',
  'caninos': 'growlithe', 'arcanin': 'arcanine', 'ptitard': 'poliwag', 'têtarte': 'poliwhirl',
  'tartard': 'poliwrath', 'abra': 'abra', 'kadabra': 'kadabra', 'alakazam': 'alakazam',
  'machoc': 'machop', 'machopeur': 'machoke', 'mackogneur': 'machamp', 'chetiflor': 'bellsprout',
  'boustiflor': 'weepinbell', 'empiflor': 'victreebel', 'tentacool': 'tentacool', 'tentacruel': 'tentacruel',
  'racaillou': 'geodude', 'gravalanch': 'graveler', 'grolem': 'golem', 'ponyta': 'ponyta',
  'galopa': 'rapidash', 'ramoloss': 'slowpoke', 'flagadoss': 'slowbro', 'magneti': 'magnemite',
  'magneton': 'magneton', 'doduo': 'doduo', 'dodrio': 'dodrio', 'otaria': 'seel', 'lamantine': 'dewgong',
  'tadmorv': 'grimer', 'grotadmorv': 'muk', 'kokiyas': 'shellder', 'crustabri': 'cloyster',
  'fantominus': 'gastly', 'spectrum': 'haunter', 'ectoplasma': 'gengar', 'onix': 'onix',
  'soporifik': 'drowzee', 'hypnomade': 'hypno', 'krabby': 'krabby', 'krabboss': 'kingler',
  'voltorbe': 'voltorb', 'électrode': 'electrode', 'noeunoeuf': 'exeggcute', 'noadkoko': 'exeggutor',
  'osselait': 'cubone', 'ossatueur': 'marowak', 'kicklee': 'hitmonlee', 'tygnon': 'hitmonchan',
  'lipchaleur': 'lickitung', 'smogogo': 'koffing', 'smogaware': 'weezing', 'rhinocorne': 'rhyhorn',
  'rhinoféros': 'rhydon', 'leveinard': 'chansey', 'saquedeneu': 'tangela', 'kangourex': 'kangaskhan',
  'hypotrempe': 'horsea', 'hypocéan': 'seadra', 'poissirène': 'goldeen', 'poissoroy': 'seaking',
  'étoιlus': 'staryu', 'staross': 'starmie', 'lippoutou': 'mr-mime', 'insécateur': 'scyther',
  'júpiter': 'jynx', 'élektek': 'electabuzz', 'magmar': 'magmar', 'scarabrute': 'pinsir',
  'tauros': 'tauros', 'magicarpe': 'magikarp', 'léviator': 'gyarados', 'lokhlass': 'lapras',
  'métamorph': 'ditto', 'évoli': 'eevee', 'aquali': 'vaporeon', 'voltali': 'jolteon',
  'pyroli': 'flareon', 'porygon': 'porygon', 'amonita': 'omanyte', 'amonistar': 'omastar',
  'kabuto': 'kabuto', 'kabutops': 'kabutops', 'ptéra': 'aerodactyl', 'ronflex': 'snorlax',
  'artikodin': 'articuno', 'électhor': 'zapdos', 'sulfura': 'moltres', 'minidraco': 'dratini',
  'draco': 'dragonair', 'dracolosse': 'dragonite', 'mewtwo': 'mewtwo', 'mew': 'mew',
}

function normalizeCardName(name: string): string {
  const lower = name.toLowerCase().trim()
  return FR_TO_EN[lower] || name
}

async function normalizeToEnglish(cardName: string, game: string): Promise<string> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: `You are a TCG card name translator. Return ONLY the official English card name, nothing else.\nGame: ${game}\nCard: ${cardName}\nEnglish name:` }]
      })
    })
    const data = await res.json()
    return data.content?.[0]?.text?.trim() || cardName
  } catch { return cardName }
}

export async function POST(req: NextRequest) {
  try {
    const { cardName, game, setName } = await req.json()
    if (!cardName || !game) return NextResponse.json({ error: 'Missing card info' }, { status: 400 })

    const normalizedName = await normalizeToEnglish(cardName, game)
    console.log('[market] normalized:', cardName, '->', normalizedName)

    const [baseData, ebayData, cardmarketData] = await Promise.all([
      getMarketData(normalizedName, game, setName),
      getEbaySoldListings(normalizedName, game, setName),
      getCardmarketData(normalizedName, game),
    ])

    if (!baseData && !ebayData) return NextResponse.json({ data: null })

    let data = baseData

    if (ebayData && baseData) {
      data = {
        ...baseData,
        raw: ebayData.raw.count > 0 ? ebayData.raw : baseData.raw,
        grades: {
          psa7: ebayData.grades.psa7 || baseData.grades.psa7,
          psa8: ebayData.grades.psa8 || baseData.grades.psa8,
          psa9: ebayData.grades.psa9 || baseData.grades.psa9,
          psa10: ebayData.grades.psa10 || baseData.grades.psa10,
        },
        volume: ebayData.volume,
        trends: { days7: ebayData.trends.days7 || baseData.trends.days7, days30: baseData.trends.days30 },
        source: ebayData.raw.count > 0 ? `eBay + ${baseData.source}` : baseData.source,
        gradeSource: ebayData.grades.psa10 ? 'eBay Sold Listings' : baseData.gradeSource,
      }
    }

    return NextResponse.json({ data, cardmarket: cardmarketData })
  } catch (err) {
    console.error('Market data error:', err)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
