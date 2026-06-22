import { z } from 'zod'

export const AgeGroupSchema = z.enum(['3-5', '6-8', '9-11', '12-14'])
export const GroupSizeSchema = z.enum(['1-5', '6-10', '11-20', '21+'])
export const ActivityTypeSchema = z.enum([
  'jogo',
  'reflexao',
  'arte',
  'teatro',
  'musica',
  'experimento',
  'oracao',
  'quebra-gelo',
])
export const DifficultySchema = z.enum(['facil', 'medio', 'avancado'])
export const EnvironmentSchema = z.enum(['sala', 'salao', 'externo', 'qualquer'])
export const EnergyLevelSchema = z.enum(['calmo', 'moderado', 'agitado'])
export const ActivityStatusSchema = z.enum([
  'rascunho',
  'revisao-pedagogica',
  'revisao-biblica',
  'aprovado',
  'arquivado',
])

// V2 — neutralidade denominacional

export const TheologicalLevelSchema = z.enum(['essential', 'interpretive', 'denominational'])
export const EditorialRiskSchema = z.enum(['low', 'medium', 'high'])
export const ReviewStatusSchema = z.enum([
  'draft',
  'biblical_review',
  'pedagogical_review',
  'pastoral_review',
  'approved',
  'rejected',
  'archived',
])

export const HIGH_RISK_TAGS = [
  'batismo',
  'ceia',
  'dons-espirituais',
  'linguas',
  'profecia',
  'cura',
  'predestinacao',
  'livre-arbitrio',
  'seguranca-da-salvacao',
  'governo-da-igreja',
  'ordenacao',
  'sabado',
  'dizimos',
  'prosperidade',
  'escatologia',
  'usos-e-costumes',
] as const

export const ActivityAlternativeVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
})

export const ActivityTheologySchema = z
  .object({
    level: TheologicalLevelSchema,
    risk: EditorialRiskSchema,
    denominationalTags: z.array(z.string()),
    requiresPastoralApproval: z.boolean(),
    doctrinalNotice: z.string().optional(),
    adaptationInstructions: z.array(z.string()).optional(),
    alternativeVersions: z.array(ActivityAlternativeVersionSchema).optional(),
  })
  .superRefine((theology, ctx) => {
    if (theology.risk === 'high' && !theology.requiresPastoralApproval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['requiresPastoralApproval'],
        message: 'Conteúdo de risco alto exige requiresPastoralApproval: true.',
      })
    }
    if (theology.level === 'denominational' && !theology.doctrinalNotice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['doctrinalNotice'],
        message: 'Conteúdo denominacional exige doctrinalNotice.',
      })
    }
  })

export const ActivityReviewSchema = z.object({
  status: ReviewStatusSchema,
  version: z.number().int().positive(),
  biblicalReviewer: z.string().optional(),
  pedagogicalReviewer: z.string().optional(),
  pastoralApprover: z.string().optional(),
  reviewedAt: z.string().optional(),
  notes: z.array(z.string()).optional(),
})

export const ActivitySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    themes: z.array(z.string()),
    ageGroups: z.array(AgeGroupSchema).min(1),
    groupSize: z.array(GroupSizeSchema).min(1),
    type: ActivityTypeSchema,
    durationMinutes: z.number().int().positive(),
    difficulty: DifficultySchema,
    environment: z.array(EnvironmentSchema).min(1),
    energyLevel: EnergyLevelSchema,
    bibleReference: z.string().min(1),
    mainTruth: z.string().min(1),
    objective: z.string().min(1),
    materials: z.array(z.string()),
    preparation: z.array(z.string()),
    steps: z.array(z.string()).min(1),
    discussionQuestions: z.array(z.string()),
    prayerSuggestion: z.string(),
    memoryVerse: z.string(),
    safetyNotes: z.array(z.string()),
    youngerAdaptation: z.string().optional(),
    olderAdaptation: z.string().optional(),
    noMaterialsAlternative: z.string().optional(),
    tags: z.array(z.string()),
    status: ActivityStatusSchema.default('aprovado'),
    theology: ActivityTheologySchema.optional(),
    review: ActivityReviewSchema.optional(),
  })
  .superRefine((activity, ctx) => {
    // Conteúdo publicado exige status aprovado
    if (
      activity.review?.status === 'approved' &&
      activity.theology?.risk === 'high' &&
      !activity.review?.pastoralApprover
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['review', 'pastoralApprover'],
        message: 'Conteúdo aprovado de risco alto exige pastoralApprover.',
      })
    }
    // Tags de risco alto devem ativar requiresPastoralApproval
    const hasHighRiskTag = HIGH_RISK_TAGS.some((tag) => activity.tags.includes(tag))
    if (
      hasHighRiskTag &&
      activity.theology !== undefined &&
      !activity.theology.requiresPastoralApproval
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['theology', 'requiresPastoralApproval'],
        message: `Tag de risco alto detectada. Defina theology.requiresPastoralApproval: true.`,
      })
    }
  })

export const ActivityListSchema = z.array(ActivitySchema)

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  description: z.string().min(1),
})

export const CategoryListSchema = z.array(CategorySchema)
