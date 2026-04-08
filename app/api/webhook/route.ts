import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0')

    if (userId && credits > 0) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('scan_credits')
        .eq('id', userId)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ scan_credits: profile.scan_credits + credits })
          .eq('id', userId)
      }

      // Log la transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        credits_added: credits,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        stripe_session_id: session.id,
        pack: session.metadata?.pack,
      })
    }
  }

  return NextResponse.json({ received: true })
}
