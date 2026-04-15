'use client'
import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: string | null
}

// Un Error Boundary c'est un composant React spécial
// qui attrape les erreurs de ses enfants
// comme un filet de sécurité
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Cette méthode s'appelle automatiquement quand une erreur survient
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          padding: '20px', borderRadius: 14,
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'flex-start', gap: 12
        }}>
          <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 12, color: '#888', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              This section failed to load. Try refreshing the page.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
