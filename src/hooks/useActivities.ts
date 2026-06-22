import { useMemo } from 'react'
import type { Activity, Category } from '@/types'
import { ActivityListSchema, CategoryListSchema } from '@/schemas/activity'

import categoriesRaw from '@/data/categories.json'
import historiasRaw from '@/data/activities/historias-da-biblia.json'
import jesusRaw from '@/data/activities/jesus-e-o-evangelho.json'
import oracaoRaw from '@/data/activities/oracao-e-relacionamento.json'
import caracterRaw from '@/data/activities/carater-cristao.json'
import frutoRaw from '@/data/activities/fruto-do-espirito.json'
import igrejaRaw from '@/data/activities/igreja-e-comunhao.json'
import missoesRaw from '@/data/activities/missoes-e-evangelismo.json'
import quebraRaw from '@/data/activities/quebra-gelo.json'

const allActivityFiles = [
  historiasRaw,
  jesusRaw,
  oracaoRaw,
  caracterRaw,
  frutoRaw,
  igrejaRaw,
  missoesRaw,
  quebraRaw,
]

// Parse once at module level — fails loudly in dev if JSON is invalid
const categories: Category[] = CategoryListSchema.parse(categoriesRaw)
const allActivities: Activity[] = ActivityListSchema.parse(allActivityFiles.flat())

export function useActivities() {
  return useMemo(() => ({ activities: allActivities, categories }), [])
}

export function useActivityById(id: string): Activity | undefined {
  return useMemo(() => allActivities.find((a) => a.id === id), [id])
}

export function useActivitiesByCategory(categoryId: string): Activity[] {
  return useMemo(
    () => allActivities.filter((a) => a.category === categoryId),
    [categoryId],
  )
}
