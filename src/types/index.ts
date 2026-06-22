export type AgeGroup = '3-5' | '6-8' | '9-11' | '12-14'
export type GroupSize = '1-5' | '6-10' | '11-20' | '21+'
export type ActivityType =
  | 'jogo'
  | 'reflexao'
  | 'arte'
  | 'teatro'
  | 'musica'
  | 'experimento'
  | 'oracao'
  | 'quebra-gelo'
export type Difficulty = 'facil' | 'medio' | 'avancado'
export type Environment = 'sala' | 'salao' | 'externo' | 'qualquer'
export type EnergyLevel = 'calmo' | 'moderado' | 'agitado'
export type ActivityStatus =
  | 'rascunho'
  | 'revisao-pedagogica'
  | 'revisao-biblica'
  | 'aprovado'
  | 'arquivado'

// V2 — neutralidade denominacional e governança de conteúdo

export type TheologicalLevel = 'essential' | 'interpretive' | 'denominational'

export type EditorialRisk = 'low' | 'medium' | 'high'

export type ReviewStatus =
  | 'draft'
  | 'biblical_review'
  | 'pedagogical_review'
  | 'pastoral_review'
  | 'approved'
  | 'rejected'
  | 'archived'

export interface ActivityAlternativeVersion {
  id: string
  label: string
  description: string
}

export interface ActivityTheology {
  level: TheologicalLevel
  risk: EditorialRisk
  denominationalTags: string[]
  requiresPastoralApproval: boolean
  doctrinalNotice?: string
  adaptationInstructions?: string[]
  alternativeVersions?: ActivityAlternativeVersion[]
}

export interface ActivityReview {
  status: ReviewStatus
  version: number
  biblicalReviewer?: string
  pedagogicalReviewer?: string
  pastoralApprover?: string
  reviewedAt?: string
  notes?: string[]
}

export interface Activity {
  id: string
  title: string
  summary: string
  category: string
  themes: string[]
  ageGroups: AgeGroup[]
  groupSize: GroupSize[]
  type: ActivityType
  durationMinutes: number
  difficulty: Difficulty
  environment: Environment[]
  energyLevel: EnergyLevel
  bibleReference: string
  mainTruth: string
  objective: string
  materials: string[]
  preparation: string[]
  steps: string[]
  discussionQuestions: string[]
  prayerSuggestion: string
  memoryVerse: string
  safetyNotes: string[]
  youngerAdaptation?: string
  olderAdaptation?: string
  noMaterialsAlternative?: string
  tags: string[]
  status: ActivityStatus
  theology?: ActivityTheology
  review?: ActivityReview
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface LessonStep {
  activityId: string | null
  label: string
  durationMinutes: number
  notes: string
}

export interface LessonPlan {
  id: string
  title: string
  ageGroup: AgeGroup
  groupSize: GroupSize
  theme: string
  totalDurationMinutes: number
  environment: Environment
  steps: LessonStep[]
  observations: string
  createdAt: Date
  completedAt: Date | null
}

export interface AppSettings {
  teacherName: string
  churchName: string
  primaryAgeGroup: AgeGroup | ''
  bibleVersion: string
}

export interface Filters {
  search: string
  ageGroups: AgeGroup[]
  types: ActivityType[]
  maxDuration: number | null
  environments: Environment[]
  energyLevels: EnergyLevel[]
  noMaterialsOnly: boolean
}
