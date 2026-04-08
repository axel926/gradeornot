import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TCG_ADJECTIVES = [
  'Shadow', 'Holographic', 'Shiny', 'Ancient', 'Prism', 'Ultra', 'Secret',
  'Rainbow', 'Golden', 'Crystal', 'Dark', 'Light', 'Radiant', 'Stellar',
  'Phantom', 'Legendary', 'Mythic', 'Prismatic', 'Vintage', 'Graded'
]

const TCG_NOUNS = [
  'Charizard', 'Pikachu', 'Mewtwo', 'Lugia', 'Mew', 'Gengar', 'Eevee',
  'Blastoise', 'Venusaur', 'Raichu', 'Gyarados', 'Alakazam', 'Machamp',
  'Dragonite', 'Snorlax', 'Articuno', 'Zapdos', 'Moltres', 'Ditto', 'Jolteon'
]

function generateUsername(): string {
  const adj = TCG_ADJECTIVES[Math.floor(Math.random() * TCG_ADJECTIVES.length)]
  const noun = TCG_NOUNS[Math.floor(Math.random() * TCG_NOUNS.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${adj}${noun}#${num}`
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, avatarUrl } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Vérifie si le profil existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ profile: existing, created: false })
    }

    // Génère un username unique
    let username = generateUsername()
    let attempts = 0
    while (attempts < 10) {
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()
      if (!taken) break
      username = generateUsername()
      attempts++
    }

    // Crée le profil
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        username,
        scan_credits: 5,
        total_scans: 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ profile, created: true })

  } catch (err) {
    console.error('Profile creation error:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
