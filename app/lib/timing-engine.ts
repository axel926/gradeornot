export type TimingSignal = 'GRADE_NOW' | 'WAIT' | 'SELL_RAW' | 'HOLD'

export interface TimingRecommendation {
  signal: TimingSignal
  label: string
  color: string
  reason: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface TimingInput {
  trend7d: number | null
  trend30d: number | null
  roi: number
  psaGrade: number
  rawValue: number
  volume7d: number
}

export function getTimingRecommendation(input: TimingInput): TimingRecommendation {
  const { trend7d, trend30d, roi, psaGrade, rawValue, volume7d } = input

  // Prix en forte hausse → vendre RAW maintenant
  if (trend7d !== null && trend7d >= 20) {
    return {
      signal: 'SELL_RAW',
      label: 'SELL RAW NOW',
      color: '#22C55E',
      reason: `Price up ${trend7d}% this week — sell raw before grading delay erodes gains`,
      urgency: 'HIGH'
    }
  }

  // Prix en forte baisse → attendre
  if (trend7d !== null && trend7d <= -15) {
    return {
      signal: 'WAIT',
      label: 'WAIT',
      color: '#F5B731',
      reason: `Price down ${Math.abs(trend7d)}% this week — wait for stabilization before grading`,
      urgency: 'MEDIUM'
    }
  }

  // ROI excellent + tendance positive → grader maintenant
  if (roi >= 30 && (trend7d === null || trend7d >= 0) && psaGrade >= 8) {
    return {
      signal: 'GRADE_NOW',
      label: 'GRADE NOW',
      color: '#22C55E',
      reason: `Strong ROI (${roi}%) with stable/rising prices — optimal time to submit`,
      urgency: 'HIGH'
    }
  }

  // ROI négatif → tenir
  if (roi < 0) {
    return {
      signal: 'HOLD',
      label: 'HOLD RAW',
      color: '#888',
      reason: `Grading not profitable at current prices — hold and monitor`,
      urgency: 'LOW'
    }
  }

  // Tendance 30j positive mais 7j stable → bon moment
  if (trend30d !== null && trend30d >= 10 && (trend7d === null || Math.abs(trend7d) < 5)) {
    return {
      signal: 'GRADE_NOW',
      label: 'GRADE NOW',
      color: '#22C55E',
      reason: `30-day uptrend (+${trend30d}%) with stable recent prices — good entry point`,
      urgency: 'MEDIUM'
    }
  }

  // Valeur trop basse → attendre
  if (rawValue < 30) {
    return {
      signal: 'WAIT',
      label: 'WAIT',
      color: '#F5B731',
      reason: `Raw value ($${rawValue}) too low — grading fees not justified yet`,
      urgency: 'LOW'
    }
  }

  // Default — tenir et surveiller
  return {
    signal: 'HOLD',
    label: 'HOLD & MONITOR',
    color: '#888',
    reason: 'No strong signal — monitor price trends before deciding',
    urgency: 'LOW'
  }
}
