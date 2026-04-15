import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkPortfolioAlerts } from '../../../lib/alerts'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email')
      .not('email', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found', sent: 0 })
    }

    let totalSent = 0
    for (const user of users) {
      if (!user.email) continue
      try {
        const result = await checkPortfolioAlerts(user.id, user.email)
        totalSent += result.sent
      } catch {
        console.error(`Alert failed for user ${user.id}`)
      }
    }

    return NextResponse.json({ message: 'Alerts checked', usersChecked: users.length, alertsSent: totalSent })
  } catch (err) {
    console.error('Cron alerts error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
