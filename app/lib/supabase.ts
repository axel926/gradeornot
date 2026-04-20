import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  scan_credits: number
  total_scans: number
  created_at: string
}
