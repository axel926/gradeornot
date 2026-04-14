import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectOpportunities } from '../../lib/opportunities'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // D'abord on cherche dans le cache Supabase
    const { data: cached } = await supabase
      .from('opportunities')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('estimated_roi', { ascending: false })
      .limit(5)

    // Si on a des données fraiches en cache on les retourne directement
    if (cached && cached.length > 0) {
      return NextResponse.json({ opportunities: cached, source: 'cache' })
    }

    // Sinon on recalcule
    const fresh = await detectOpportunities()
    return NextResponse.json({ opportunities: fresh, source: 'live' })

  } catch (err) {
    console.error('Opportunities error:', err)
    return NextResponse.json({ opportunities: [], error: 'Failed' })
  }
}
