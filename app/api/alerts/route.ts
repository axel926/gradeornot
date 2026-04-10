import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkPortfolioAlerts } from '../../lib/alerts'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!profile?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const result = await checkPortfolioAlerts(userId, profile.email)

    return NextResponse.json({ success: true, alertsSent: result.sent })
  } catch (err) {
    console.error('Alerts error:', err)
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 })
  }
}
