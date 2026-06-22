import { create } from 'zustand'
import type { Filters, AgeGroup, ActivityType, Environment, EnergyLevel } from '@/types'

const DEFAULT_FILTERS: Filters = {
  search: '',
  ageGroups: [],
  types: [],
  maxDuration: null,
  environments: [],
  energyLevels: [],
  noMaterialsOnly: false,
}

interface FiltersStore {
  filters: Filters
  setSearch: (search: string) => void
  toggleAgeGroup: (age: AgeGroup) => void
  toggleType: (type: ActivityType) => void
  setMaxDuration: (max: number | null) => void
  toggleEnvironment: (env: Environment) => void
  toggleEnergyLevel: (level: EnergyLevel) => void
  toggleNoMaterials: () => void
  resetFilters: () => void
  hasActiveFilters: () => boolean
}

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  filters: DEFAULT_FILTERS,

  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),

  toggleAgeGroup: (age) =>
    set((s) => ({
      filters: {
        ...s.filters,
        ageGroups: s.filters.ageGroups.includes(age)
          ? s.filters.ageGroups.filter((a) => a !== age)
          : [...s.filters.ageGroups, age],
      },
    })),

  toggleType: (type) =>
    set((s) => ({
      filters: {
        ...s.filters,
        types: s.filters.types.includes(type)
          ? s.filters.types.filter((t) => t !== type)
          : [...s.filters.types, type],
      },
    })),

  setMaxDuration: (max) => set((s) => ({ filters: { ...s.filters, maxDuration: max } })),

  toggleEnvironment: (env) =>
    set((s) => ({
      filters: {
        ...s.filters,
        environments: s.filters.environments.includes(env)
          ? s.filters.environments.filter((e) => e !== env)
          : [...s.filters.environments, env],
      },
    })),

  toggleEnergyLevel: (level) =>
    set((s) => ({
      filters: {
        ...s.filters,
        energyLevels: s.filters.energyLevels.includes(level)
          ? s.filters.energyLevels.filter((l) => l !== level)
          : [...s.filters.energyLevels, level],
      },
    })),

  toggleNoMaterials: () =>
    set((s) => ({ filters: { ...s.filters, noMaterialsOnly: !s.filters.noMaterialsOnly } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  hasActiveFilters: () => {
    const { filters } = get()
    return (
      filters.search !== '' ||
      filters.ageGroups.length > 0 ||
      filters.types.length > 0 ||
      filters.maxDuration !== null ||
      filters.environments.length > 0 ||
      filters.energyLevels.length > 0 ||
      filters.noMaterialsOnly
    )
  },
}))
