export const fr = {
  // Nav
  home: 'Accueil',
  portfolio: 'Portefeuille',
  dashboard: 'Tableau de bord',
  profile: 'Profil',
  signIn: 'Connexion',
  signOut: 'Déconnexion',

  // Scanner
  dropCard: 'Déposez votre carte ici',
  orClickBrowse: 'ou cliquez pour parcourir · JPG, PNG, WEBP',
  useCamera: 'Utiliser la caméra',
  analyzeCard: 'Analyser cette carte',
  analyzingCard: 'ANALYSE EN COURS',

  // Results
  verdict: 'VERDICT',
  sendIt: 'ENVOYER',
  skipIt: 'PASSER',
  borderline: 'BORDERLINE',
  netProfit: 'PROFIT NET',
  roi: 'ROI',
  breakEven: 'SEUIL DE RENTABILITÉ',
  minSalePrice: 'prix de vente minimum',
  afterAllCosts: 'après tous les frais',
  returnOnInvestment: 'retour sur investissement',
  whyThisVerdict: 'POURQUOI CE VERDICT',
  gradingServices: 'SERVICES DE NOTATION',
  visualGradeAnalysis: 'ANALYSE VISUELLE',
  marketData: 'DONNÉES DE MARCHÉ',
  roiCalculator: 'CALCULATEUR ROI',
  scenarioSimulation: 'SIMULATION DE SCÉNARIOS',

  // Grade
  estPsaGrade: 'GRADE PSA EST.',
  rawValue: 'VALEUR BRUTE',
  gradeProbability: 'PROBABILITÉ DE GRADE',
  estimated: 'ESTIMÉ',

  // Scenarios
  bestCase: 'MEILLEUR CAS',
  likelyCase: 'CAS PROBABLE',
  worstCase: 'PIRE CAS',

  // Portfolio
  addCard: 'Ajouter une carte',
  invested: 'INVESTI',
  portfolioValue: 'VALEUR DU PORTEFEUILLE',
  totalPnL: 'P&L TOTAL',
  status: {
    raw: 'BRUT',
    sent: 'ENVOYÉ',
    graded: 'GRADÉ',
    sold: 'VENDU',
  },

  // Decisions
  gradeCriteria: {
    roi: 'ROI ≥ 30%',
    profit: 'Profit net > 20$',
    grade: 'Grade est. ≥ PSA 7.5',
    probability: 'Probabilité PSA 9+ ≥ 25%',
    value: 'Valeur brute ≥ 15$',
  },

  // Loader steps
  loaderSteps: [
    { label: 'Scan visuel de la carte', sub: 'Détection des bordures, surfaces, coins et bords...' },
    { label: 'Identification de la carte', sub: 'Correspondance avec la base TCG — nom, set, version...' },
    { label: 'Analyse de grade', sub: 'Application des critères PSA/BGS — centrage, surfaces, coins, bords...' },
    { label: 'Récupération des prix', sub: 'Données en direct de TCGPlayer, Scryfall, PriceCharting...' },
    { label: 'Calcul du ROI', sub: 'Calcul des frais de grading, envoi, frais de vente et profit net...' },
    { label: 'Génération du rapport', sub: 'Compilation de votre analyse complète...' },
  ],

  // Disclaimer
  disclaimer: 'Les probabilités de grade sont des estimations statistiques. Aucun outil ou service de notation ne peut garantir un grade spécifique. GradeOrNot fournit une aide à la décision uniquement.',
}

export type Translations = typeof fr
