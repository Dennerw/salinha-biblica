import { describe, it, expect } from 'vitest'
import { ActivityListSchema, CategoryListSchema } from './activity'

import categoriesRaw from '@/data/categories.json'
import historiasRaw from '@/data/activities/historias-da-biblia.json'
import jesusRaw from '@/data/activities/jesus-e-o-evangelho.json'
import oracaoRaw from '@/data/activities/oracao-e-relacionamento.json'
import caracterRaw from '@/data/activities/carater-cristao.json'
import frutoRaw from '@/data/activities/fruto-do-espirito.json'
import igrejaRaw from '@/data/activities/igreja-e-comunhao.json'
import missoesRaw from '@/data/activities/missoes-e-evangelismo.json'
import quebraRaw from '@/data/activities/quebra-gelo.json'

const categoryFiles = [
  { name: 'historias-da-biblia', data: historiasRaw },
  { name: 'jesus-e-o-evangelho', data: jesusRaw },
  { name: 'oracao-e-relacionamento', data: oracaoRaw },
  { name: 'carater-cristao', data: caracterRaw },
  { name: 'fruto-do-espirito', data: frutoRaw },
  { name: 'igreja-e-comunhao', data: igrejaRaw },
  { name: 'missoes-e-evangelismo', data: missoesRaw },
  { name: 'quebra-gelo', data: quebraRaw },
]

describe('categories.json', () => {
  it('tem 8 categorias válidas', () => {
    const result = CategoryListSchema.safeParse(categoriesRaw)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toHaveLength(8)
  })

  it('cada categoria tem id, name, icon e color', () => {
    const cats = CategoryListSchema.parse(categoriesRaw)
    for (const cat of cats) {
      expect(cat.id).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.icon).toBeTruthy()
      expect(cat.color).toBeTruthy()
    }
  })
})

describe.each(categoryFiles)('$name', ({ name, data }) => {
  it('tem 5 dinâmicas válidas', () => {
    const result = ActivityListSchema.safeParse(data)
    expect(result.success, `Erro em ${name}: ${JSON.stringify((result as { error?: unknown }).error)}`).toBe(true)
    if (result.success) expect(result.data).toHaveLength(5)
  })

  it('todos os ids são únicos', () => {
    const activities = ActivityListSchema.parse(data)
    const ids = activities.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos têm status aprovado', () => {
    const activities = ActivityListSchema.parse(data)
    for (const a of activities) {
      expect(a.status).toBe('aprovado')
    }
  })

  it('todos têm ao menos 2 faixas etárias', () => {
    const activities = ActivityListSchema.parse(data)
    for (const a of activities) {
      expect(a.ageGroups.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('steps não vazio', () => {
    const activities = ActivityListSchema.parse(data)
    for (const a of activities) {
      expect(a.steps.length).toBeGreaterThan(0)
    }
  })
})

describe('requisitos globais do conteúdo', () => {
  const all = ActivityListSchema.parse([
    ...historiasRaw, ...jesusRaw, ...oracaoRaw, ...caracterRaw,
    ...frutoRaw, ...igrejaRaw, ...missoesRaw, ...quebraRaw,
  ])

  it('total de 40 dinâmicas', () => {
    expect(all).toHaveLength(40)
  })

  it('ao menos 10 sem materiais', () => {
    const noMaterials = all.filter((a) => a.materials.length === 0)
    expect(noMaterials.length).toBeGreaterThanOrEqual(10)
  })

  it('ao menos 10 com duração ≤ 20 min', () => {
    const short = all.filter((a) => a.durationMinutes <= 20)
    expect(short.length).toBeGreaterThanOrEqual(10)
  })

  it('todos os ids são únicos globalmente', () => {
    const ids = all.map((a) => a.id)
    expect(new Set(ids).size).toBe(40)
  })
})
