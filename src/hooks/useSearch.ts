import { useMemo } from 'react'
import type { Activity } from '@/types'
import type { Filters } from '@/types'
import { matchesSearch } from '@/utils/normalize'

export function useSearch(activities: Activity[], filters: Filters): Activity[] {
  return useMemo(() => {
    return activities.filter((a) => {
      // Text search across multiple fields
      if (filters.search) {
        const haystack = [a.title, a.summary, a.bibleReference, ...a.themes, ...a.tags].join(' ')
        if (!matchesSearch(haystack, filters.search)) return false
      }

      // Age group filter (OR: activity must cover at least one selected age)
      if (filters.ageGroups.length > 0) {
        if (!filters.ageGroups.some((age) => a.ageGroups.includes(age))) return false
      }

      // Type filter
      if (filters.types.length > 0) {
        if (!filters.types.includes(a.type)) return false
      }

      // Max duration
      if (filters.maxDuration !== null) {
        if (a.durationMinutes > filters.maxDuration) return false
      }

      // Environment filter
      if (filters.environments.length > 0) {
        if (!filters.environments.some((env) => a.environment.includes(env))) return false
      }

      // Energy level filter
      if (filters.energyLevels.length > 0) {
        if (!filters.energyLevels.includes(a.energyLevel)) return false
      }

      // No materials only
      if (filters.noMaterialsOnly && a.materials.length > 0) return false

      // Theological level filter
      if (filters.theologicalLevels.length > 0) {
        const level = a.theology?.level ?? 'essential'
        if (!filters.theologicalLevels.includes(level)) return false
      }

      // Editorial risk filter
      if (filters.editorialRisks.length > 0) {
        const risk = a.theology?.risk ?? 'low'
        if (!filters.editorialRisks.includes(risk)) return false
      }

      return true
    })
  }, [activities, filters])
}
