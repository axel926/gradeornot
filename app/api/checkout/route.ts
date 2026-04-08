import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PACKS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 10 },
  pro: { priceId: process.env.STRIPE_PRICE_PRO!, credits: 25 },
  vault: { priceId: process.env.STRIPE_PRICE_VAULT!, credits: 60 },
}

export async function POST(req: NextRequest) {
  try {
    const { pack, userId, userEmail } = await req.json()

    if (!PACKS[pack as keyof typeof PACKS]) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }

    const { priceId, credits } = PACKS[pack as keyof typeof PACKS]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&credits=${credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      customer_email: userEmail,
      metadata: { userId, credits: credits.toString(), pack },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
