// Les challenges changent chaque semaine
// Ils poussent les users à utiliser l'app régulièrement

export interface Challenge {
  id: string
  title: string
  description: string
  emoji: string
  target: number
  unit: string
  reward: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  color: string
}

// On calcule la semaine actuelle pour avoir des challenges cohérents
function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

// Rotation des challenges selon la semaine
const CHALLENGE_POOLS: Challenge[][] = [
  // Pool 1
  [
    { id: 'scan5', title: 'Quick Scanner', description: 'Scan 5 cards this week', emoji: '📸', target: 5, unit: 'scans', reward: 'Sharp Eye badge unlock', difficulty: 'EASY', color: '#22C55E' },
    { id: 'roi50', title: 'ROI Hunter', description: 'Find a card with 50%+ estimated ROI', emoji: '🎯', target: 50, unit: '% ROI', reward: 'Sniper badge unlock', difficulty: 'HARD', color: '#F5B731' },
    { id: 'portfolio3', title: 'Collector', description: 'Add 3 cards to your portfolio', emoji: '📦', target: 3, unit: 'cards', reward: 'Collector badge progress', difficulty: 'MEDIUM', color: '#888' },
  ],
  // Pool 2
  [
    { id: 'scan10', title: 'Grading Machine', description: 'Scan 10 cards this week', emoji: '⚡', target: 10, unit: 'scans', reward: 'Grader Pro badge progress', difficulty: 'MEDIUM', color: '#22C55E' },
    { id: 'batch1', title: 'Batch Master', description: 'Use batch scan on 5+ cards at once', emoji: '🔥', target: 5, unit: 'cards at once', reward: 'Batch badge unlock', difficulty: 'EASY', color: '#F5B731' },
    { id: 'profit100', title: 'Profit Seeker', description: 'Find a card with $100+ expected profit', emoji: '💰', target: 100, unit: '$ profit', reward: 'Profit Hunter badge progress', difficulty: 'HARD', color: '#22C55E' },
  ],
  // Pool 3
  [
    { id: 'grade1', title: 'First Grade', description: 'Mark a card as graded in portfolio', emoji: '🏆', target: 1, unit: 'graded', reward: 'Grader Pro badge', difficulty: 'EASY', color: '#F5B731' },
    { id: 'scan3', title: 'Daily Habit', description: 'Scan at least 1 card for 3 days straight', emoji: '📅', target: 3, unit: 'days', reward: 'Streak badge progress', difficulty: 'MEDIUM', color: '#888' },
    { id: 'psa9', title: 'Quality Over Quantity', description: 'Find a card with PSA 9+ estimate', emoji: '⭐', target: 9, unit: 'PSA est.', reward: 'Sharp Eye badge', difficulty: 'MEDIUM', color: '#22C55E' },
  ],
]

export function getWeeklyChallenges(): Challenge[] {
  const week = getWeekNumber()
  // On tourne entre les pools selon la semaine
  return CHALLENGE_POOLS[week % CHALLENGE_POOLS.length]
}

export function getDaysUntilReset(): number {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=dimanche, 1=lundi...
  // Reset le lundi
  return dayOfWeek === 0 ? 1 : 8 - dayOfWeek
}
