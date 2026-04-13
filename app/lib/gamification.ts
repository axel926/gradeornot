export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  totalScans: number
  totalROI: number
  avgROI: number
  psA10Predictions: number
  correctGradePredictions: number
  portfolioCards: number
  streak: number
  totalProfit: number
}

export const BADGES: Badge[] = [
  {
    id: 'first_scan',
    name: 'First Scan',
    emoji: '🔍',
    description: 'Scanned your first card',
    condition: (s) => s.totalScans >= 1,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    emoji: '🎯',
    description: 'Found a card with 50%+ ROI',
    condition: (s) => s.totalROI >= 50,
  },
  {
    id: 'grader_pro',
    name: 'Grader Pro',
    emoji: '🏆',
    description: 'Scanned 50+ cards',
    condition: (s) => s.totalScans >= 50,
  },
  {
    id: 'collector',
    name: 'Collector',
    emoji: '📦',
    description: 'Added 10+ cards to portfolio',
    condition: (s) => s.portfolioCards >= 10,
  },
  {
    id: 'streak_week',
    name: 'Week Streak',
    emoji: '🔥',
    description: '7 days in a row',
    condition: (s) => s.streak >= 7,
  },
  {
    id: 'profit_hunter',
    name: 'Profit Hunter',
    emoji: '💰',
    description: '$500+ total expected profit',
    condition: (s) => s.totalProfit >= 500,
  },
  {
    id: 'sharp_eye',
    name: 'Sharp Eye',
    emoji: '👁',
    description: 'Scanned 10+ cards',
    condition: (s) => s.totalScans >= 10,
  },
  {
    id: 'whale',
    name: 'Whale',
    emoji: '🐳',
    description: '$2000+ total expected profit',
    condition: (s) => s.totalProfit >= 2000,
  },
]

export function getLevel(totalScans: number): { level: number; title: string; nextAt: number } {
  if (totalScans >= 500) return { level: 10, title: 'LEGEND', nextAt: 999 }
  if (totalScans >= 200) return { level: 9, title: 'MASTER', nextAt: 500 }
  if (totalScans >= 100) return { level: 8, title: 'EXPERT', nextAt: 200 }
  if (totalScans >= 50) return { level: 7, title: 'VETERAN', nextAt: 100 }
  if (totalScans >= 25) return { level: 6, title: 'ANALYST', nextAt: 50 }
  if (totalScans >= 10) return { level: 5, title: 'INVESTOR', nextAt: 25 }
  if (totalScans >= 5) return { level: 4, title: 'TRADER', nextAt: 10 }
  if (totalScans >= 3) return { level: 3, title: 'COLLECTOR', nextAt: 5 }
  if (totalScans >= 1) return { level: 2, title: 'ROOKIE', nextAt: 3 }
  return { level: 1, title: 'NEWCOMER', nextAt: 1 }
}

export function getEarnedBadges(stats: UserStats): Badge[] {
  return BADGES.filter(b => b.condition(stats))
}

export function getNextBadge(stats: UserStats): Badge | null {
  return BADGES.find(b => !b.condition(stats)) || null
}
