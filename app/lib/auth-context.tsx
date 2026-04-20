'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContext {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContext>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Écoute tous les events auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthProvider] event:', event, 'user:', session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Aussi getSession en parallèle — si INITIAL_SESSION est déjà passé
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] getSession:', session?.user?.email)
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
