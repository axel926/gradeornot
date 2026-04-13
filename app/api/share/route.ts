import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { cardName, game, verdict, roi, netProfit, psaGrade, rawValue } = await req.json()

    const verdictColor = verdict === 'GRADE' ? '#22C55E' : verdict === 'SKIP' ? '#EF4444' : '#F5B731'
    const verdictLabel = verdict === 'GRADE' ? 'SEND IT' : verdict === 'SKIP' ? 'SKIP IT' : 'BORDERLINE'

    const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0B"/>
      <stop offset="100%" stop-color="#111113"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFD580"/>
      <stop offset="100%" stop-color="#D4981A"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Border -->
  <rect x="2" y="2" width="1196" height="626" rx="20" fill="none" stroke="rgba(245,183,49,0.2)" stroke-width="2"/>
  
  <!-- Verdict color accent -->
  <rect x="0" y="0" width="8" height="630" rx="4" fill="${verdictColor}"/>

  <!-- Logo -->
  <rect x="60" y="50" width="44" height="44" rx="10" fill="#F5B731"/>
  <text x="82" y="78" font-family="monospace" font-size="20" font-weight="bold" fill="#0A0A0B" text-anchor="middle">⚡</text>
  <text x="118" y="78" font-family="monospace" font-size="18" font-weight="bold" fill="#E8E8EC" letter-spacing="3">GRADEORNOT</text>

  <!-- Card name -->
  <text x="60" y="170" font-family="monospace" font-size="14" fill="#F5B731" letter-spacing="3">${game.toUpperCase()}</text>
  <text x="60" y="240" font-family="Impact, monospace" font-size="72" font-weight="bold" fill="#E8E8EC" letter-spacing="4">${cardName.toUpperCase()}</text>

  <!-- Verdict -->
  <rect x="60" y="280" width="320" height="90" rx="14" fill="${verdictColor}22"/>
  <rect x="60" y="280" width="320" height="90" rx="14" fill="none" stroke="${verdictColor}44" stroke-width="2"/>
  <text x="80" y="315" font-family="monospace" font-size="12" fill="${verdictColor}" letter-spacing="2">VERDICT</text>
  <text x="80" y="355" font-family="Impact, monospace" font-size="36" font-weight="bold" fill="${verdictColor}" letter-spacing="4">${verdictLabel}</text>

  <!-- Stats -->
  <!-- PSA Grade -->
  <rect x="420" y="280" width="180" height="90" rx="14" fill="rgba(255,255,255,0.04)"/>
  <text x="510" y="315" font-family="monospace" font-size="11" fill="#555" letter-spacing="1" text-anchor="middle">EST. PSA GRADE</text>
  <text x="510" y="355" font-family="monospace" font-size="40" font-weight="bold" fill="${psaGrade >= 9 ? '#22C55E' : '#F5B731'}" text-anchor="middle">${psaGrade}</text>

  <!-- Net Profit -->
  <rect x="620" y="280" width="180" height="90" rx="14" fill="rgba(255,255,255,0.04)"/>
  <text x="710" y="315" font-family="monospace" font-size="11" fill="#555" letter-spacing="1" text-anchor="middle">NET PROFIT</text>
  <text x="710" y="355" font-family="monospace" font-size="36" font-weight="bold" fill="${netProfit >= 0 ? '#22C55E' : '#EF4444'}" text-anchor="middle">${netProfit >= 0 ? '+' : ''}$${netProfit}</text>

  <!-- ROI -->
  <rect x="820" y="280" width="180" height="90" rx="14" fill="rgba(255,255,255,0.04)"/>
  <text x="910" y="315" font-family="monospace" font-size="11" fill="#555" letter-spacing="1" text-anchor="middle">ROI</text>
  <text x="910" y="355" font-family="monospace" font-size="36" font-weight="bold" fill="${roi >= 0 ? '#F5B731' : '#EF4444'}" text-anchor="middle">${roi >= 0 ? '+' : ''}${roi}%</text>

  <!-- Raw value -->
  <text x="60" y="430" font-family="monospace" font-size="14" fill="#555">RAW VALUE</text>
  <text x="60" y="460" font-family="monospace" font-size="24" font-weight="bold" fill="#888">$${rawValue}</text>

  <!-- URL -->
  <text x="1140" y="590" font-family="monospace" font-size="14" fill="#333" text-anchor="end">gradeornot.vercel.app</text>
</svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      }
    })
  } catch (err) {
    console.error('Share card error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
