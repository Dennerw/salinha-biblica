import { describe, it, expect, beforeEach } from 'vitest'
import { useFiltersStore } from './index'

beforeEach(() => {
  useFiltersStore.getState().resetFilters()
})

describe('useFiltersStore', () => {
  it('estado inicial sem filtros ativos', () => {
    const { filters, hasActiveFilters } = useFiltersStore.getState()
    expect(filters.search).toBe('')
    expect(filters.ageGroups).toHaveLength(0)
    expect(hasActiveFilters()).toBe(false)
  })

  it('setSearch atualiza busca e marca filtro ativo', () => {
    useFiltersStore.getState().setSearch('davi')
    expect(useFiltersStore.getState().filters.search).toBe('davi')
    expect(useFiltersStore.getState().hasActiveFilters()).toBe(true)
  })

  it('toggleAgeGroup adiciona e remove', () => {
    const store = useFiltersStore.getState()
    store.toggleAgeGroup('6-8')
    expect(useFiltersStore.getState().filters.ageGroups).toContain('6-8')
    useFiltersStore.getState().toggleAgeGroup('6-8')
    expect(useFiltersStore.getState().filters.ageGroups).not.toContain('6-8')
  })

  it('toggleType adiciona e remove', () => {
    useFiltersStore.getState().toggleType('jogo')
    expect(useFiltersStore.getState().filters.types).toContain('jogo')
    useFiltersStore.getState().toggleType('jogo')
    expect(useFiltersStore.getState().filters.types).not.toContain('jogo')
  })

  it('setMaxDuration define e pode ser anulado', () => {
    useFiltersStore.getState().setMaxDuration(30)
    expect(useFiltersStore.getState().filters.maxDuration).toBe(30)
    useFiltersStore.getState().setMaxDuration(null)
    expect(useFiltersStore.getState().filters.maxDuration).toBeNull()
  })

  it('toggleNoMaterials alterna', () => {
    useFiltersStore.getState().toggleNoMaterials()
    expect(useFiltersStore.getState().filters.noMaterialsOnly).toBe(true)
    useFiltersStore.getState().toggleNoMaterials()
    expect(useFiltersStore.getState().filters.noMaterialsOnly).toBe(false)
  })

  it('resetFilters limpa tudo e hasActiveFilters volta a false', () => {
    const store = useFiltersStore.getState()
    store.setSearch('teste')
    store.toggleAgeGroup('9-11')
    store.toggleType('reflexao')
    store.setMaxDuration(20)
    store.toggleNoMaterials()
    expect(store.hasActiveFilters()).toBe(true)

    store.resetFilters()
    const { filters } = useFiltersStore.getState()
    expect(filters.search).toBe('')
    expect(filters.ageGroups).toHaveLength(0)
    expect(filters.types).toHaveLength(0)
    expect(filters.maxDuration).toBeNull()
    expect(filters.noMaterialsOnly).toBe(false)
    expect(useFiltersStore.getState().hasActiveFilters()).toBe(false)
  })

  it('múltiplos filtros simultâneos', () => {
    const store = useFiltersStore.getState()
    store.toggleAgeGroup('6-8')
    store.toggleAgeGroup('9-11')
    store.toggleType('jogo')
    store.toggleEnergyLevel('agitado')

    const { filters } = useFiltersStore.getState()
    expect(filters.ageGroups).toHaveLength(2)
    expect(filters.types).toContain('jogo')
    expect(filters.energyLevels).toContain('agitado')
    expect(store.hasActiveFilters()).toBe(true)
  })
})
