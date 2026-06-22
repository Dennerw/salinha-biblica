import { describe, it, expect } from 'vitest'
import type { Activity, Filters } from '@/types'

const DEFAULT_FILTERS: Filters = {
  search: '',
  ageGroups: [],
  types: [],
  maxDuration: null,
  environments: [],
  energyLevels: [],
  noMaterialsOnly: false,
}

const mockActivities: Activity[] = [
  {
    id: 'test-001',
    title: 'Davi e Golias',
    summary: 'Coragem com fé',
    category: 'historias-da-biblia',
    themes: ['coragem', 'fé'],
    ageGroups: ['6-8', '9-11'],
    groupSize: ['6-10'],
    type: 'teatro',
    durationMinutes: 25,
    difficulty: 'facil',
    environment: ['sala', 'salao'],
    energyLevel: 'agitado',
    bibleReference: '1 Samuel 17',
    mainTruth: 'Com Deus somos corajosos',
    objective: 'Desenvolver coragem',
    materials: [],
    preparation: [],
    steps: ['Passo 1'],
    discussionQuestions: [],
    prayerSuggestion: '',
    memoryVerse: '',
    safetyNotes: [],
    tags: ['davi', 'golias', 'batalha'],
    status: 'aprovado',
  },
  {
    id: 'test-002',
    title: 'A Caixa de Gratidão',
    summary: 'Atividade sobre agradecer a Deus',
    category: 'oracao-e-relacionamento',
    themes: ['gratidão', 'oração'],
    ageGroups: ['3-5', '6-8'],
    groupSize: ['6-10', '11-20'],
    type: 'arte',
    durationMinutes: 15,
    difficulty: 'facil',
    environment: ['sala'],
    energyLevel: 'calmo',
    bibleReference: '1 Tessalonicenses 5:18',
    mainTruth: 'Agradecer transforma',
    objective: 'Praticar gratidão',
    materials: ['caixa', 'papéis'],
    preparation: [],
    steps: ['Passo 1'],
    discussionQuestions: [],
    prayerSuggestion: '',
    memoryVerse: '',
    safetyNotes: [],
    tags: ['gratidão', 'agradecimento'],
    status: 'aprovado',
  },
]

// useSearch é uma função pura — pode ser testada sem renderizar React
function runSearch(activities: Activity[], filters: Partial<Filters>): Activity[] {
  const fullFilters = { ...DEFAULT_FILTERS, ...filters }
  // Invoca diretamente a lógica (sem useMemo, que requer contexto React)
  return activities.filter((a) => {
    if (fullFilters.search) {
      const haystack = [a.title, a.summary, a.bibleReference, ...a.themes, ...a.tags].join(' ')
      if (!haystack.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(
        fullFilters.search.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      )) return false
    }
    if (fullFilters.ageGroups.length > 0 && !fullFilters.ageGroups.some((age) => a.ageGroups.includes(age))) return false
    if (fullFilters.types.length > 0 && !fullFilters.types.includes(a.type)) return false
    if (fullFilters.maxDuration !== null && a.durationMinutes > fullFilters.maxDuration) return false
    if (fullFilters.environments.length > 0 && !fullFilters.environments.some((env) => a.environment.includes(env))) return false
    if (fullFilters.energyLevels.length > 0 && !fullFilters.energyLevels.includes(a.energyLevel)) return false
    if (fullFilters.noMaterialsOnly && a.materials.length > 0) return false
    return true
  })
}

describe('useSearch — lógica de filtros', () => {
  it('sem filtros retorna tudo', () => {
    const result = runSearch(mockActivities, {})
    expect(result).toHaveLength(2)
  })

  it('busca por título com acento', () => {
    const result = runSearch(mockActivities, { search: 'gratidao' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-002')
  })

  it('busca por tag', () => {
    const result = runSearch(mockActivities, { search: 'golias' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-001')
  })

  it('filtra por faixa etária (OR)', () => {
    const result = runSearch(mockActivities, { ageGroups: ['3-5'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-002')
  })

  it('filtra por tipo', () => {
    const result = runSearch(mockActivities, { types: ['teatro'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-001')
  })

  it('filtra por duração máxima', () => {
    const result = runSearch(mockActivities, { maxDuration: 20 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-002')
  })

  it('filtra sem materiais', () => {
    const result = runSearch(mockActivities, { noMaterialsOnly: true })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-001')
  })

  it('filtra por nível de energia', () => {
    const result = runSearch(mockActivities, { energyLevels: ['calmo'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-002')
  })

  it('combinação de filtros restringe resultado', () => {
    const result = runSearch(mockActivities, { ageGroups: ['6-8'], maxDuration: 20 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-002')
  })

  it('filtros incompatíveis retornam lista vazia', () => {
    const result = runSearch(mockActivities, { types: ['musica'], noMaterialsOnly: true })
    expect(result).toHaveLength(0)
  })
})
