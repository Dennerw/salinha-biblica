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

export const ActivitySchema = z.object({
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
