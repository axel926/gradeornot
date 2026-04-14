import { NextResponse } from 'next/server'
import { calculateMarketIndex } from '../../lib/market-index'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Récupérer l'historique des 30 derniers jours
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data: history } = await supabase
      .from('market_index')
      .select('global_index, pokemon_index, variation_7d, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(30)

    // Calculer l'index actuel
    const current = await calculateMarketIndex()

    return NextResponse.json({ current, history: history || [] })
  } catch (err) {
    console.error('Market index error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
