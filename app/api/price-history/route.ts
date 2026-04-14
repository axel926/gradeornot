import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { cardName, game } = await req.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // On cherche l'historique des 30 derniers jours
    // Le card_key est construit de la même façon que dans market.ts
    const cardKey = `${game}__${cardName}__any`.toLowerCase().replace(/\s+/g, '_')
    
    const { data: history } = await supabase
      .from('price_history')
      .select('raw_avg, recorded_at')
      .eq('card_key', cardKey)
      .order('recorded_at', { ascending: false })
      .limit(30)

    return NextResponse.json({ history: history || [] })
  } catch (err) {
    console.error('Price history error:', err)
    return NextResponse.json({ history: [] })
  }
}
