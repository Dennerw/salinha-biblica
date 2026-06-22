import { db } from '@/db'
import type { LocalReviewRecord } from '@/db'

// Lazily imported to avoid circular dependency with the activity data files
async function getActivityIds(): Promise<string[]> {
  const [
    { default: historias },
    { default: jesus },
    { default: oracao },
    { default: carater },
    { default: fruto },
    { default: igreja },
    { default: missoes },
    { default: quebra },
  ] = await Promise.all([
    import('@/data/activities/historias-da-biblia.json'),
    import('@/data/activities/jesus-e-o-evangelho.json'),
    import('@/data/activities/oracao-e-relacionamento.json'),
    import('@/data/activities/carater-cristao.json'),
    import('@/data/activities/fruto-do-espirito.json'),
    import('@/data/activities/igreja-e-comunhao.json'),
    import('@/data/activities/missoes-e-evangelismo.json'),
    import('@/data/activities/quebra-gelo.json'),
  ])
  return [...historias, ...jesus, ...oracao, ...carater, ...fruto, ...igreja, ...missoes, ...quebra]
    .map((a: { id: string }) => a.id)
}

// Seed draft review records for activities that have none.
// Safe to call multiple times — skips activities already recorded.
export async function runMigrations(): Promise<void> {
  const existing = await db.localReview.count()
  if (existing > 0) return // already migrated

  const ids = await getActivityIds()
  const now = new Date().toISOString()

  const records: LocalReviewRecord[] = ids.map((activityId) => ({
    activityId,
    status: 'draft',
    version: 1,
    reviewedAt: now,
    history: [
      {
        from: 'draft',
        to: 'draft',
        at: now,
        notes: 'Registro inicial — migração automática.',
      },
    ],
  }))

  await db.localReview.bulkPut(records)
}
