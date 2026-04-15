'use client'

// Un "skeleton" c'est un placeholder animé
// qui montre la forme du contenu avant qu'il charge
// Comme une ombre de ce qui va apparaître
// C'est beaucoup mieux qu'un spinner car l'user
// comprend déjà la structure de la page

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}

// Skeleton pour une carte de résultat
export function CardSkeleton() {
  return (
    <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Skeleton height={12} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={28} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="50%" style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Skeleton height={60} borderRadius={10} />
        <Skeleton height={60} borderRadius={10} />
        <Skeleton height={60} borderRadius={10} />
      </div>
    </div>
  )
}

// Skeleton pour le market index
export function MarketIndexSkeleton() {
  return (
    <div style={{ padding: '20px 24px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
      <Skeleton height={10} width="30%" style={{ marginBottom: 12 }} />
      <Skeleton height={36} width="40%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="25%" style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Skeleton height={50} borderRadius={10} />
        <Skeleton height={50} borderRadius={10} />
      </div>
    </div>
  )
}
