import { describe, it, expect } from 'vitest'
import {
  ActivityTheologySchema,
  ActivityReviewSchema,
  ActivitySchema,
  HIGH_RISK_TAGS,
} from './activity'

const baseActivity = {
  id: 'test-001',
  title: 'Atividade Teste',
  summary: 'Resumo',
  category: 'historias-da-biblia',
  themes: ['coragem'],
  ageGroups: ['6-8', '9-11'],
  groupSize: ['6-10'],
  type: 'jogo',
  durationMinutes: 20,
  difficulty: 'facil',
  environment: ['sala'],
  energyLevel: 'moderado',
  bibleReference: 'Salmos 23:1',
  mainTruth: 'Deus cuida de nós.',
  objective: 'Desenvolver confiança.',
  materials: [],
  preparation: [],
  steps: ['Passo 1'],
  discussionQuestions: [],
  prayerSuggestion: '',
  memoryVerse: '',
  safetyNotes: [],
  tags: ['confiança'],
  status: 'aprovado',
} as const

describe('ActivityTheologySchema', () => {
  it('aceita conteúdo essencial de risco baixo', () => {
    const result = ActivityTheologySchema.safeParse({
      level: 'essential',
      risk: 'low',
      denominationalTags: [],
      requiresPastoralApproval: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita risco alto sem requiresPastoralApproval', () => {
    const result = ActivityTheologySchema.safeParse({
      level: 'denominational',
      risk: 'high',
      denominationalTags: ['batismo'],
      requiresPastoralApproval: false,
    })
    expect(result.success).toBe(false)
  })

  it('aceita risco alto com requiresPastoralApproval: true', () => {
    const result = ActivityTheologySchema.safeParse({
      level: 'denominational',
      risk: 'high',
      denominationalTags: ['batismo'],
      requiresPastoralApproval: true,
      doctrinalNotice: 'Converse com a liderança sobre o batismo.',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita conteúdo denominacional sem doctrinalNotice', () => {
    const result = ActivityTheologySchema.safeParse({
      level: 'denominational',
      risk: 'high',
      denominationalTags: ['ceia'],
      requiresPastoralApproval: true,
    })
    expect(result.success).toBe(false)
  })

  it('aceita conteúdo denominacional com doctrinalNotice', () => {
    const result = ActivityTheologySchema.safeParse({
      level: 'denominational',
      risk: 'medium',
      denominationalTags: [],
      requiresPastoralApproval: false,
      doctrinalNotice: 'Adapte conforme a prática local.',
    })
    expect(result.success).toBe(true)
  })
})

describe('ActivityReviewSchema', () => {
  it('aceita revisão válida', () => {
    const result = ActivityReviewSchema.safeParse({
      status: 'approved',
      version: 1,
      biblicalReviewer: 'Pastor João',
      reviewedAt: '2026-06-22',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita versão zero', () => {
    const result = ActivityReviewSchema.safeParse({
      status: 'draft',
      version: 0,
    })
    expect(result.success).toBe(false)
  })

  it('aceita status draft sem revisores', () => {
    const result = ActivityReviewSchema.safeParse({
      status: 'draft',
      version: 1,
    })
    expect(result.success).toBe(true)
  })
})

describe('ActivitySchema — superRefine theology', () => {
  it('atividade sem theology é válida (campo opcional)', () => {
    const result = ActivitySchema.safeParse(baseActivity)
    expect(result.success).toBe(true)
  })

  it('atividade com theology essencial é válida', () => {
    const result = ActivitySchema.safeParse({
      ...baseActivity,
      theology: {
        level: 'essential',
        risk: 'low',
        denominationalTags: [],
        requiresPastoralApproval: false,
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejeita atividade aprovada de risco alto sem pastoralApprover', () => {
    const result = ActivitySchema.safeParse({
      ...baseActivity,
      theology: {
        level: 'denominational',
        risk: 'high',
        denominationalTags: ['batismo'],
        requiresPastoralApproval: true,
        doctrinalNotice: 'Aviso.',
      },
      review: {
        status: 'approved',
        version: 1,
      },
    })
    expect(result.success).toBe(false)
  })

  it('aceita atividade aprovada de risco alto com pastoralApprover', () => {
    const result = ActivitySchema.safeParse({
      ...baseActivity,
      theology: {
        level: 'denominational',
        risk: 'high',
        denominationalTags: ['batismo'],
        requiresPastoralApproval: true,
        doctrinalNotice: 'Aviso.',
      },
      review: {
        status: 'approved',
        version: 1,
        pastoralApprover: 'Pastor Silva',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejeita atividade com tag de risco alto e requiresPastoralApproval: false', () => {
    const result = ActivitySchema.safeParse({
      ...baseActivity,
      tags: ['batismo', 'fe'],
      theology: {
        level: 'denominational',
        risk: 'high',
        denominationalTags: ['batismo'],
        requiresPastoralApproval: false,
        doctrinalNotice: 'Aviso.',
      },
    })
    expect(result.success).toBe(false)
  })

  it('aceita atividade com tag de risco alto e requiresPastoralApproval: true', () => {
    const result = ActivitySchema.safeParse({
      ...baseActivity,
      tags: ['batismo'],
      theology: {
        level: 'denominational',
        risk: 'high',
        denominationalTags: ['batismo'],
        requiresPastoralApproval: true,
        doctrinalNotice: 'Aviso sobre batismo.',
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('HIGH_RISK_TAGS', () => {
  it('contém os tópicos denominacionais esperados', () => {
    expect(HIGH_RISK_TAGS).toContain('batismo')
    expect(HIGH_RISK_TAGS).toContain('ceia')
    expect(HIGH_RISK_TAGS).toContain('escatologia')
    expect(HIGH_RISK_TAGS).toContain('dons-espirituais')
    expect(HIGH_RISK_TAGS).toContain('prosperidade')
  })

  it('tem pelo menos 15 tags', () => {
    expect(HIGH_RISK_TAGS.length).toBeGreaterThanOrEqual(15)
  })
})
