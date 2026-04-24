import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCardPrice } from '../../lib/prices'
import { getPSAPopulation, getDefaultProbabilities } from '../../lib/psa-population'
import { runDecisionEngine } from '../../lib/decision-engine'
import { validateCardIdentification } from '../../lib/card-database'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GRADING_SERVICES = {
  PSA: {
    name: 'PSA',
    tiers: [
      { name: 'Value', turnaround: '60-120 days', cost: 25 },
      { name: 'Regular', turnaround: '30-45 days', cost: 50 },
      { name: 'Express', turnaround: '10 days', cost: 150 },
      { name: 'Super Express', turnaround: '5 days', cost: 300 },
    ],
    shipping: { toGrader: 20, fromGrader: 20, insurance: 0.015 },
    url: 'https://www.psacard.com',
    logo: 'PSA'
  },
  BGS: {
    name: 'BGS (Beckett)',
    tiers: [
      { name: 'Economy', turnaround: '90 days', cost: 22 },
      { name: 'Standard', turnaround: '30 days', cost: 40 },
      { name: 'Express', turnaround: '10 days', cost: 100 },
      { name: 'Premium', turnaround: '3 days', cost: 250 },
    ],
    shipping: { toGrader: 18, fromGrader: 18, insurance: 0.01 },
    url: 'https://www.beckett.com/grading',
    logo: 'BGS'
  },
  CGC: {
    name: 'CGC',
    tiers: [
      { name: 'Economy', turnaround: '60-80 days', cost: 12 },
      { name: 'Standard', turnaround: '20-30 days', cost: 25 },
      { name: 'Express', turnaround: '10 days', cost: 50 },
      { name: 'Walkthrough', turnaround: '2 days', cost: 150 },
    ],
    shipping: { toGrader: 15, fromGrader: 15, insurance: 0.01 },
    url: 'https://www.cgccards.com',
    logo: 'CGC'
  }
}

// Multiplicateurs réalistes basés sur les données du marché TCG
// Source: analyses PSA population + eBay sold listings
function estimateGradedValue(rawValue: number, psaGrade: number) {
  // Les multiplicateurs varient selon la valeur de la carte
  // Cartes high-value ont un premium PSA10 plus élevé
  const isHighValue = rawValue >= 100
  const isMidValue = rawValue >= 30 && rawValue < 100

  if (psaGrade >= 9.5) {
    if (isHighValue) return { PSA10: Math.round(rawValue * 6), PSA9: Math.round(rawValue * 2.5), PSA8: Math.round(rawValue * 1.4) }
    if (isMidValue) return { PSA10: Math.round(rawValue * 5), PSA9: Math.round(rawValue * 2.2), PSA8: Math.round(rawValue * 1.3) }
    return { PSA10: Math.round(rawValue * 4), PSA9: Math.round(rawValue * 2), PSA8: Math.round(rawValue * 1.2) }
  }
  if (psaGrade >= 8.5) {
    if (isHighValue) return { PSA10: Math.round(rawValue * 4.5), PSA9: Math.round(rawValue * 2), PSA8: Math.round(rawValue * 1.3) }
    if (isMidValue) return { PSA10: Math.round(rawValue * 3.5), PSA9: Math.round(rawValue * 1.8), PSA8: Math.round(rawValue * 1.2) }
    return { PSA10: Math.round(rawValue * 3), PSA9: Math.round(rawValue * 1.6), PSA8: Math.round(rawValue * 1.15) }
  }
  if (psaGrade >= 7.5) {
    return { PSA10: Math.round(rawValue * 2.5), PSA9: Math.round(rawValue * 1.4), PSA8: Math.round(rawValue * 1.1) }
  }
  // PSA < 7.5 — grading rarement rentable
  return { PSA10: Math.round(rawValue * 2), PSA9: Math.round(rawValue * 1.2), PSA8: Math.round(rawValue * 1.0) }
}

const PLATFORM_FEE = 0.1325 // eBay 13.25%

function calculateROI(
  gradedValues: { PSA10: number; PSA9: number; PSA8: number },
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number },
  rawValue: number,
  gradingCost: number,
  shippingTotal: number
) {
  const totalCost = rawValue + gradingCost + shippingTotal

  // Valeur attendue pondérée par les probabilités de grade
  // PSA7 et moins → on revend raw à -15% (dégradation packaging)
  const expectedGrossValue =
    (gradedValues.PSA10 * (gradeProbabilities.psa10 / 100)) +
    (gradedValues.PSA9 * (gradeProbabilities.psa9 / 100)) +
    (gradedValues.PSA8 * (gradeProbabilities.psa8 / 100)) +
    (rawValue * 0.80 * (gradeProbabilities.psa7 / 100))

  // Déduction des frais plateforme
  const expectedNetValue = expectedGrossValue * (1 - PLATFORM_FEE)
  const profit = Math.round(expectedNetValue - totalCost)
  const roi = totalCost > 0 ? Math.round(((expectedNetValue - totalCost) / totalCost) * 100) : 0

  // Valeur affichée = valeur attendue nette (pour le bestTier)
  const gradedValue = Math.round(expectedNetValue)

  return { profit, roi, totalCost: Math.round(totalCost), gradedValue }
}

function buildGradingAnalysis(
  rawValue: number,
  psaGrade: number,
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
) {
  const gradedValues = estimateGradedValue(rawValue, psaGrade)
  const gradingAnalysis: Record<string, unknown> = {}
  for (const [serviceKey, service] of Object.entries(GRADING_SERVICES)) {
    const tiers = service.tiers.map(tier => {
      const shippingCost = service.shipping.toGrader + service.shipping.fromGrader
      const insuranceCost = Math.round(rawValue * service.shipping.insurance)
      const shippingTotal = shippingCost + insuranceCost
      const roiData = calculateROI(gradedValues, gradeProbabilities, rawValue, tier.cost, shippingTotal)
      return {
        ...tier,
        shippingTotal,
        gradedValue: roiData.gradedValue,
        profit: roiData.profit,
        roi: roiData.roi,
        worthIt: roiData.profit > 20 && roiData.roi > 30
      }
    })
    gradingAnalysis[serviceKey] = { ...service, tiers, bestTier: tiers.find(t => t.worthIt) || tiers[0] }
  }
  return { gradingAnalysis, gradedValues }
}

// Convertit les labels de condition en scores numériques
function conditionToScore(value: string, type: 'centering' | 'surfaces' | 'corners' | 'edges'): number {
  if (type === 'centering') {
    if (value.includes('Perfect')) return 10
    if (value.includes('Good')) return 8
    if (value.includes('Off')) return 6
    if (value.includes('Poor')) return 4
    return 7
  }
  if (type === 'surfaces') {
    if (value.includes('Clean')) return 10
    if (value.includes('Minor')) return 8
    if (value.includes('Scratches')) return 5
    if (value.includes('Heavy')) return 3
    return 7
  }
  if (type === 'corners') {
    if (value.includes('Sharp')) return 10
    if (value.includes('Light')) return 8
    if (value.includes('Rounded')) return 5
    if (value.includes('Heavy')) return 3
    return 7
  }
  if (type === 'edges') {
    if (value.includes('Clean')) return 10
    if (value.includes('Light')) return 8
    if (value.includes('Chipped')) return 5
    if (value.includes('Heavy')) return 3
    return 7
  }
  return 7
}

export async function POST(req: NextRequest) {
  // MODE MOCK — retourne un résultat fictif sans appeler Claude
  if (process.env.MOCK_CLAUDE === 'true') {
    const mockResult = {
      analysis: {
        cardName: 'Charizard', game: 'Pokemon', setName: 'Base Set',
        setNumber: '4/102', year: '1999', rarity: 'Holo Rare',
        language: 'English', version: 'Unlimited',
        condition: { overall: 'Near Mint', centering: 'Good', surfaces: 'Clean', corners: 'Sharp', edges: 'Clean' },
        criteriaScores: { centering: 8.5, surfaces: 9.0, corners: 8.5, edges: 9.0 },
        estimatedPSAGrade: 8.5, gradeConfidence: 78,
        estimatedRawValue: 180,
        estimatedGradedValue: { PSA10: 850, PSA9: 420, PSA8: 280 },
        gradingRecommendation: 'GRADE',
        recommendationReason: 'Strong ROI potential with PSA 9+ probability above 40%.',
        keyIssues: ['Slight centering issue — left border wider than right'],
        realPriceFound: true, priceSource: 'TCGPlayer',
        realPriceData: { market: 151.20, mid: 159.99, low: 92.59, high: 209.81 },
        gradeProbabilities: { psa10: 8, psa9: 35, psa8: 38, psa7: 19 },
        decisionRules: [
          { id: 'roi', label: 'ROI ≥ 30%', passed: true, value: '42%', weight: 30, detail: 'Expected ROI of 42%' },
          { id: 'profit', label: 'Net profit > $20', passed: true, value: '$68', weight: 25, detail: 'Net profit $68' },
          { id: 'grade', label: 'Est. grade ≥ PSA 7.5', passed: true, value: 'PSA 8.5', weight: 20, detail: 'Grade estimate 8.5' },
          { id: 'probability', label: 'PSA 9+ probability ≥ 25%', passed: true, value: '43%', weight: 15, detail: '43% chance PSA 9+' },
          { id: 'value', label: 'Raw value ≥ $15', passed: true, value: '$180', weight: 10, detail: 'Raw value $180' },
        ],
      },
      gradingAnalysis: {
        PSA: {
          name: 'PSA', bestTier: { name: 'Regular', turnaround: '60-120 days', cost: 50, shippingTotal: 40, gradedValue: 280, profit: 68, roi: 42, worthIt: true },
          tiers: []
        }
      }
    }
    return NextResponse.json(mockResult)
  }
  try {
    const { image, mimeType, overrideCard, manualSearch, userId } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    let analysis

    if (overrideCard) {
      const condRes = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            {
              type: 'text',
              text: `Analyze ONLY the physical condition of this card. The card is: ${overrideCard.cardName} from ${overrideCard.setName}.

Respond ONLY with valid JSON:
{
  "condition": {
    "overall": "Mint | Near Mint | Excellent | Very Good | Good | Poor",
    "centering": "Perfect | Good | Off | Poor",
    "surfaces": "Clean | Minor scratches | Scratches | Heavy wear",
    "corners": "Sharp | Light wear | Rounded | Heavy wear",
    "edges": "Clean | Light wear | Chipped | Heavy wear"
  },
  "estimatedPSAGrade": 8.5,
  "gradeConfidence": 75,
  "gradingRecommendation": "GRADE | SKIP | MAYBE",
  "recommendationReason": "1-2 sentences",
  "keyIssues": []
}`
            }
          ]
        }]
      })
      const condText = condRes.content[0].type === 'text' ? condRes.content[0].text : ''
      const condData = JSON.parse(condText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
      analysis = { ...overrideCard, ...condData, isCardDetected: true }

    } else if (manualSearch) {
      const searchRes = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            {
              type: 'text',
              text: `The user says this card is: "${manualSearch}". Analyze the card condition and confirm identification.

Respond ONLY with valid JSON:
{
  "cardName": "confirmed name",
  "game": "Pokemon | Magic: The Gathering | One Piece | Yu-Gi-Oh | Lorcana | Other",
  "setName": "set name",
  "year": "year",
  "rarity": "rarity",
  "language": "language",
  "condition": {
    "overall": "Mint | Near Mint | Excellent | Very Good | Good | Poor",
    "centering": "Perfect | Good | Off | Poor",
    "surfaces": "Clean | Minor scratches | Scratches | Heavy wear",
    "corners": "Sharp | Light wear | Rounded | Heavy wear",
    "edges": "Clean | Light wear | Chipped | Heavy wear"
  },
  "estimatedPSAGrade": 8.5,
  "gradeConfidence": 75,
  "estimatedRawValue": 50,
  "gradingRecommendation": "GRADE | SKIP | MAYBE",
  "recommendationReason": "1-2 sentences",
  "keyIssues": [],
  "isCardDetected": true
}`
            }
          ]
        }]
      })
      const searchText = searchRes.content[0].type === 'text' ? searchRes.content[0].text : ''
      analysis = JSON.parse(searchText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    } else {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            {
              type: 'text',
              text: `You are a professional TCG card grader with 20 years of PSA/BGS experience. Analyze this specific card image with extreme visual precision.

STEP 1 — CENTERING (PSA weight 40%):
Look at the card borders carefully. Measure visually the white border widths.
10.0=perfect 55/45, 9.5=57/43, 9.0=60/40, 8.5=62/38, 8.0=65/35, 7.0=70/30, 6.0=75/25, 5.0=80/20
Give a SPECIFIC decimal score based on what you actually see.

STEP 2 — SURFACES (PSA weight 30%):
Examine front and back for scratches, print lines, stains, creases, holo damage, yellowing.
10.0=pristine, 9.5=one micro mark, 9.0=1-2 tiny marks, 8.5=few light marks, 8.0=light scratches, 7.0=moderate, 6.0=heavy.
Give a SPECIFIC decimal score.

STEP 3 — CORNERS (PSA weight 20%):
Examine all 4 corners for fraying, rounding, whitening.
10.0=razor sharp all 4, 9.5=one micro fray, 9.0=one slight fray, 8.5=two corners slight, 8.0=2-3 fraying, 7.0=rounded, 6.0=heavily worn.
Give a SPECIFIC decimal score.

STEP 4 — EDGES (PSA weight 10%):
Examine all 4 edges for chipping, roughness, nicking.
10.0=perfect, 9.5=one micro nick, 9.0=minor nick, 8.5=2-3 nicks, 8.0=chipping visible, 7.0=moderate chipping.
Give a SPECIFIC decimal score.

SCORING RULES:
- Use decimals: 8.5, 7.5, 9.5 not just round numbers
- Scores MUST differ from each other based on what you actually see
- Most cards score 6.0-9.0, very few deserve 9.5+
- If image is blurry/dark, reduce all scores by 0.5-1.0
- A card with PSA grade 5 should have criteria scores averaging around 5, not 8

KEY ISSUES: Only list defects you can ACTUALLY SEE with specifics:
- "Left border ~30% wider than right (estimated 65/35 centering)"
- "Diagonal scratch visible on front surface"
- "Bottom-left corner shows fraying"
Empty array [] if card looks clean. DO NOT invent issues.

If high confidence, respond FORMAT A. If ambiguous, respond FORMAT B.

FORMAT A:
{
  "cardName": "exact name",
  "game": "Pokemon | Magic: The Gathering | One Piece | Yu-Gi-Oh | Lorcana | Other",
  "setName": "set name",
  "setNumber": "card number e.g. 4/102",
  "year": "year",
  "rarity": "rarity",
  "language": "English | Japanese | French | etc",
  "version": "1st Edition | Unlimited | Shadow | Reverse Holo | etc",
  "condition": {
    "overall": "Mint | Near Mint | Excellent | Very Good | Good | Poor",
    "centering": "Perfect | Good | Off | Poor",
    "surfaces": "Clean | Minor scratches | Scratches | Heavy wear",
    "corners": "Sharp | Light wear | Rounded | Heavy wear",
    "edges": "Clean | Light wear | Chipped | Heavy wear"
  },
  "estimatedPSAGrade": 8.5,
  "gradeConfidence": 75,
  "estimatedRawValue": 50,
  "gradingRecommendation": "GRADE | SKIP | MAYBE",
  "recommendationReason": "1-2 sentences",
  "keyIssues": [],
  "isCardDetected": true,
  "ambiguous": false
}

FORMAT B:
{
  "isCardDetected": true,
  "ambiguous": true,
  "suggestions": [
    { "cardName": "name", "setName": "set", "year": "year", "rarity": "rarity", "language": "language", "confidence": 85, "estimatedRawValue": 45 }
  ]
}

If no card: { "isCardDetected": false }

IMPORTANT: gradeConfidence must be a NUMBER 0-100 (not "High"/"Medium"/"Low").
Be conservative with grades. Be precise with card identification.`
            }
          ]
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      // Extraction robuste du premier bloc JSON valide
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new SyntaxError('No JSON found in response')
      analysis = JSON.parse(jsonMatch[0])
    }

    if (!analysis.isCardDetected) {
      return NextResponse.json({ error: 'No trading card detected. Please upload a clear photo.' }, { status: 400 })
    }

    if (analysis.ambiguous && analysis.suggestions) {
      return NextResponse.json({ suggestions: analysis.suggestions })
    }

    // Calcule les scores numériques par critère
    // Utiliser les scores numériques de Claude directement si disponibles
    const criteriaScores = analysis.criteriaScores ? {
      centering: Number(analysis.criteriaScores.centering) || conditionToScore(analysis.condition?.centering || '', 'centering'),
      surfaces: Number(analysis.criteriaScores.surfaces) || conditionToScore(analysis.condition?.surfaces || '', 'surfaces'),
      corners: Number(analysis.criteriaScores.corners) || conditionToScore(analysis.condition?.corners || '', 'corners'),
      edges: Number(analysis.criteriaScores.edges) || conditionToScore(analysis.condition?.edges || '', 'edges'),
    } : {
      centering: conditionToScore(analysis.condition?.centering || '', 'centering'),
      surfaces: conditionToScore(analysis.condition?.surfaces || '', 'surfaces'),
      corners: conditionToScore(analysis.condition?.corners || '', 'corners'),
      edges: conditionToScore(analysis.condition?.edges || '', 'edges'),
    }

    // Normalise gradeConfidence en nombre
    let confidence = analysis.gradeConfidence
    if (typeof confidence === 'string') {
      confidence = confidence === 'High' ? 80 : confidence === 'Medium' ? 60 : 40
    }
    confidence = Math.min(100, Math.max(0, Number(confidence) || 60))

    console.log('[price lookup]', analysis.cardName, analysis.game, analysis.setName, analysis.setNumber, analysis.version)
    const realPrice = await getCardPrice(analysis.cardName, analysis.game, analysis.setName, analysis.setNumber, analysis.version)
    console.log('[price result]', realPrice.found, realPrice.set, realPrice.prices.market)
    const rawValue = realPrice.found && realPrice.prices.market
      ? Math.round(realPrice.prices.market)
      : analysis.estimatedRawValue || 50

    const defaultProbs = getDefaultProbabilities(analysis.estimatedPSAGrade, confidence)
    const { gradingAnalysis, gradedValues } = buildGradingAnalysis(rawValue, analysis.estimatedPSAGrade, defaultProbs)

    const enrichedAnalysis = {
      ...analysis,
      estimatedRawValue: rawValue,
      estimatedGradedValue: gradedValues,
      criteriaScores,
      gradeConfidence: confidence,
      realPriceFound: realPrice.found,
      priceSource: realPrice.found
        ? (analysis.game?.toLowerCase().includes('magic') ? 'Scryfall' : 'TCGPlayer')
        : 'AI Estimate',
      realPriceData: realPrice.found ? realPrice.prices : null,
      cardImage: realPrice.image || null,
    }

    // Sauvegarde déplacée après le moteur de décision

    // Validation de l'identification par la base de données
    const validation = await validateCardIdentification(
      analysis.game,
      analysis.cardName,
      analysis.setNumber,
      analysis.setName,
      analysis.year
    )

    const cardValidation = {
      validated: validation.validated,
      needsConfirmation: validation.needsConfirmation,
      bestMatch: validation.bestMatch ? {
        name: validation.bestMatch.card.name,
        setName: validation.bestMatch.card.setName,
        number: validation.bestMatch.card.number,
        year: validation.bestMatch.card.year,
        imageUrl: validation.bestMatch.card.imageUrl,
        confidence: validation.bestMatch.confidence,
      } : null,
      alternativeMatches: validation.matches.slice(1, 3).map(m => ({
        name: m.card.name,
        setName: m.card.setName,
        number: m.card.number,
        year: m.card.year,
        confidence: m.confidence,
      }))
    }

    // Fetch real PSA population probabilities
    const psaPop = await getPSAPopulation(analysis.cardName, analysis.game)
    const gradeProbabilities = psaPop
      ? psaPop.probabilities
      : getDefaultProbabilities(analysis.estimatedPSAGrade, enrichedAnalysis.gradeConfidence)

    const finalAnalysis = {
      ...enrichedAnalysis,
      gradeProbabilities,
      psaPopulation: psaPop ? {
        total: psaPop.total,
        byGrade: psaPop.byGrade,
        source: psaPop.source
      } : null,
    }

    // Moteur de décision
    const bestService = Object.values(gradingAnalysis)[0] as {
      tiers: { cost: number; shippingTotal: number }[]
      bestTier: { cost: number; shippingTotal: number }
    }
    const decision = runDecisionEngine({
      psaGrade: finalAnalysis.estimatedPSAGrade,
      rawValue: rawValue,
      gradedValues: gradedValues,
      gradeProbabilities: gradeProbabilities,
      gradingCost: bestService?.bestTier?.cost || 50,
      shippingTotal: bestService?.bestTier?.shippingTotal || 40,
      sellingFee: 13.25,
      criteriaScores: finalAnalysis.criteriaScores || { centering: 8, surfaces: 8, corners: 8, edges: 8 },
      keyIssues: finalAnalysis.keyIssues || [],
      game: finalAnalysis.game,
      rarity: finalAnalysis.rarity,
    })

    const finalWithDecision = {
      ...finalAnalysis,
      cardValidation,
      gradingRecommendation: decision.verdict,
      recommendationReason: decision.summary,
      decisionScore: decision.score,
      decisionConfidence: decision.confidence,
      decisionRules: decision.rules,
    }

    // Mettre à jour le leaderboard
    if (userId) {
      try {
        const { createClient: createClientAdmin } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClientAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!
        )
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('username, total_scans')
          .eq('id', userId)
          .single()

        if (profile) {
          await supabaseAdmin.from('leaderboard').upsert({
            user_id: userId,
            username: profile.username || 'Anonymous',
            total_scans: (profile.total_scans || 0) + 1,
            best_roi: Math.max(decision.score || 0, 0),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        }
      } catch { /* leaderboard update failed silently */ }
    }

    // Sauvegarder le scan complet avec toutes les données
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const { createClient: createClientSave } = await import('@supabase/supabase-js')
        const supabaseSave = createClientSave(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY
        )
        await supabaseSave.from('scans').insert({
          user_id: userId,
          card_name: finalWithDecision.cardName,
          game: finalWithDecision.game,
          psa_grade_estimate: finalWithDecision.estimatedPSAGrade,
          raw_value: rawValue,
          recommendation: finalWithDecision.gradingRecommendation,
          full_analysis: {
            analysis: finalWithDecision,
            gradingAnalysis,
            imagePreview: null
          }
        })
        // Incrémenter total_scans du profil
        await supabaseSave.rpc('increment_scans', { user_id_param: userId })
      } catch { /* save failed silently */ }
    }

    return NextResponse.json({ analysis: finalWithDecision, gradingAnalysis })

  } catch (err: unknown) {
    console.error('Analysis error:', err)
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Could not parse card analysis. Try a clearer image.' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
