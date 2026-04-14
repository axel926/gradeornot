// Ce fichier génère un export compatible avec le formulaire PSA
// PSA accepte des soumissions via leur portail en ligne

export interface PSASubmissionCard {
  cardName: string
  game: string
  setName: string
  setNumber: string
  year: string
  language: string
  version: string
  estimatedValue: number
  gradingTier: string
  quantity: number
}

export interface PSASubmission {
  cards: PSASubmissionCard[]
  totalCards: number
  totalDeclaredValue: number
  recommendedService: string
  estimatedCost: number
  estimatedTurnaround: string
}

// Convertit nos données en format PSA
export function generatePSASubmission(cards: PSASubmissionCard[]): PSASubmission {
  const totalCards = cards.reduce((a, c) => a + c.quantity, 0)
  const totalDeclaredValue = cards.reduce((a, c) => a + c.estimatedValue * c.quantity, 0)

  // Recommande le tier selon la valeur moyenne
  const avgValue = totalDeclaredValue / totalCards
  let recommendedService = 'Economy'
  let estimatedCost = 25
  let estimatedTurnaround = '100+ days'

  if (avgValue >= 500) {
    recommendedService = 'Super Express'
    estimatedCost = 500
    estimatedTurnaround = '2 days'
  } else if (avgValue >= 200) {
    recommendedService = 'Express'
    estimatedCost = 150
    estimatedTurnaround = '10 days'
  } else if (avgValue >= 75) {
    recommendedService = 'Regular'
    estimatedCost = 50
    estimatedTurnaround = '60-120 days'
  }

  return {
    cards,
    totalCards,
    totalDeclaredValue,
    recommendedService,
    estimatedCost: estimatedCost * totalCards,
    estimatedTurnaround,
  }
}

// Génère un CSV téléchargeable
export function exportToCSV(submission: PSASubmission): string {
  const headers = [
    'Card Name',
    'Game',
    'Set Name',
    'Card Number',
    'Year',
    'Language',
    'Version',
    'Declared Value',
    'Quantity',
    'Grading Tier',
  ]

  const rows = submission.cards.map(c => [
    `"${c.cardName}"`,
    `"${c.game}"`,
    `"${c.setName}"`,
    `"${c.setNumber}"`,
    `"${c.year}"`,
    `"${c.language}"`,
    `"${c.version}"`,
    c.estimatedValue,
    c.quantity,
    `"${c.gradingTier}"`,
  ])

  // CSV = valeurs séparées par des virgules
  // C'est le format universel pour Excel et les portails web
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

// Télécharge le fichier CSV dans le navigateur
export function downloadCSV(csv: string, filename: string) {
  // On crée un "blob" — un objet fichier en mémoire
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  // On crée un lien invisible et on simule un clic dessus
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
