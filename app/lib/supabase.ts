import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'gradeornot-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  }
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
