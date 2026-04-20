import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://gradeornot.vercel.app'
  const code = searchParams.get('code')

  if (code) {
    const response = NextResponse.redirect(`${origin}/?welcome=true`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    if (data.user) {
      await fetch(`${origin}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name,
          avatarUrl: data.user.user_metadata?.avatar_url,
        }),
      })
    }
    return response
  }
  return NextResponse.redirect(`${origin}/`)
}
