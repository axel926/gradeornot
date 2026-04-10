export interface EbaySoldListing {
  title: string
  price: number
  soldDate: string
  grade: number | null
  gradingService: string | null
  condition: string
  url: string
}

export interface EbayMarketData {
  soldListings: EbaySoldListing[]
  raw: {
    avg: number | null
    median: number | null
    min: number | null
    max: number | null
    count: number
  }
  grades: {
    psa7: number | null
    psa8: number | null
    psa9: number | null
    psa10: number | null
  }
  volume: { days7: number; days30: number }
  trends: { days7: number | null; days30: number | null }
}

function extractGrade(title: string): { grade: number | null; service: string | null } {
  const titleUpper = title.toUpperCase()

  // Détecte PSA
  const psaMatch = titleUpper.match(/PSA\s*(\d+(?:\.\d+)?)/)
  if (psaMatch) return { grade: parseFloat(psaMatch[1]), service: 'PSA' }

  // Détecte BGS
  const bgsMatch = titleUpper.match(/BGS\s*(\d+(?:\.\d+)?)/)
  if (bgsMatch) return { grade: parseFloat(bgsMatch[1]), service: 'BGS' }

  // Détecte CGC
  const cgcMatch = titleUpper.match(/CGC\s*(\d+(?:\.\d+)?)/)
  if (cgcMatch) return { grade: parseFloat(cgcMatch[1]), service: 'CGC' }

  return { grade: null, service: null }
}

function removeOutliers(prices: number[]): number[] {
  if (prices.length < 4) return prices
  const sorted = [...prices].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  return sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
}

function calcStats(prices: number[]) {
  const clean = removeOutliers(prices)
  if (clean.length === 0) return { avg: null, median: null, min: null, max: null, count: 0 }
  const sorted = [...clean].sort((a, b) => a - b)
  const avg = Math.round(clean.reduce((a, b) => a + b, 0) / clean.length * 100) / 100
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 * 100) / 100
    : Math.round(sorted[Math.floor(sorted.length / 2)] * 100) / 100
  return {
    avg, median,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    count: clean.length
  }
}

function avgByGrade(listings: EbaySoldListing[], grade: number): number | null {
  const prices = listings
    .filter(l => l.grade === grade || (grade === 9 && l.grade && l.grade >= 9 && l.grade < 10))
    .map(l => l.price)
  if (prices.length === 0) return null
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100
}

export async function getEbaySoldListings(
  cardName: string,
  game: string,
  setName?: string
): Promise<EbayMarketData | null> {
  const appId = process.env.EBAY_APP_ID
  if (!appId) return null

  try {
    // Search query optimisée pour les cartes TCG
    const gameKeyword = game.toLowerCase().includes('pokemon') ? 'Pokemon'
      : game.toLowerCase().includes('magic') ? 'MTG'
      : game.toLowerCase().includes('one piece') ? 'One Piece TCG'
      : game.toLowerCase().includes('yu-gi-oh') ? 'Yugioh'
      : game.toLowerCase().includes('lorcana') ? 'Lorcana'
      : ''

    const searchQuery = `${cardName} ${gameKeyword} ${setName || ''}`.trim()

    // eBay Browse API - sold items (OAuth Application token)
    // Get app token first
    const tokenRes = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${appId}:${process.env.EBAY_CERT_ID}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
    })

    if (!tokenRes.ok) {
      console.error('eBay token error:', await tokenRes.text())
      return null
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    if (!accessToken) return null

    // Search sold items via Finding API with OAuth
    const url = new URL('https://svcs.ebay.com/services/search/FindingService/v1')
    url.searchParams.set('OPERATION-NAME', 'findCompletedItems')
    url.searchParams.set('SERVICE-VERSION', '1.0.0')
    url.searchParams.set('SECURITY-APPNAME', appId)
    url.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON')
    url.searchParams.set('keywords', searchQuery)
    url.searchParams.set('itemFilter(0).name', 'SoldItemsOnly')
    url.searchParams.set('itemFilter(0).value', 'true')
    url.searchParams.set('itemFilter(1).name', 'Currency')
    url.searchParams.set('itemFilter(1).value', 'USD')
    url.searchParams.set('sortOrder', 'EndTimeSoonest')
    url.searchParams.set('paginationInput.entriesPerPage', '100')
    url.searchParams.set('categoryId', '2536')

    const res = await fetch(url.toString())
    if (!res.ok) return null

    const data = await res.json()
    const items = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || []

    if (items.length === 0) return null

    const now = new Date()
    const day7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const day30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parse les ventes
    const listings: EbaySoldListing[] = items.map((item: Record<string, unknown[]>) => {
      const sellingStatus = item.sellingStatus?.[0] as Record<string, {__value__: string}[]>
      const price = parseFloat(sellingStatus?.currentPrice?.[0]?.__value__ || '0')
      const title = item.title?.[0] as string || ''
      const soldDate = (item.listingInfo?.[0] as Record<string, unknown[]>)?.endTime?.[0] as string || ''
      const condition = (item.condition?.[0] as Record<string, unknown[]>)?.conditionDisplayName?.[0] as string || ''
      const url = item.viewItemURL?.[0] as string || ''
      const { grade, service } = extractGrade(title)

      return { title, price, soldDate, grade, gradingService: service, condition, url }
    }).filter((l: EbaySoldListing) => l.price > 0)

    // Sépare RAW vs gradées
    const rawListings = listings.filter(l => !l.grade)
    const gradedListings = listings.filter(l => l.grade !== null)

    // Calcule volumes
    const listings7d = listings.filter(l => new Date(l.soldDate) >= day7ago)
    const listings30d = listings.filter(l => new Date(l.soldDate) >= day30ago)

    // Calcule tendances
    const prices7d = listings7d.map(l => l.price)
    const pricesOlder = listings
      .filter(l => new Date(l.soldDate) < day7ago && new Date(l.soldDate) >= day30ago)
      .map(l => l.price)

    const avg7d = prices7d.length > 0 ? prices7d.reduce((a, b) => a + b, 0) / prices7d.length : null
    const avgOlder = pricesOlder.length > 0 ? pricesOlder.reduce((a, b) => a + b, 0) / pricesOlder.length : null
    const trend7d = avg7d && avgOlder ? Math.round(((avg7d - avgOlder) / avgOlder) * 100 * 10) / 10 : null

    return {
      soldListings: listings.slice(0, 20),
      raw: calcStats(rawListings.map(l => l.price)),
      grades: {
        psa7: avgByGrade(gradedListings, 7),
        psa8: avgByGrade(gradedListings, 8),
        psa9: avgByGrade(gradedListings, 9),
        psa10: avgByGrade(gradedListings, 10),
      },
      volume: { days7: listings7d.length, days30: listings30d.length },
      trends: { days7: trend7d, days30: null }
    }
  } catch (err) {
    console.error('eBay API error:', err)
    return null
  }
}
