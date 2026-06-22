import { useState, useEffect, useCallback } from 'react'
import type { ReviewStatus, ActivityTheology } from '@/types'
import { localReviewDb, type LocalReviewRecord } from '@/db'
import { validateTransition, theologicalSnapshot } from '@/utils/review'

export function useLocalReview(activityId: string, theology?: ActivityTheology) {
  const [record, setRecord] = useState<LocalReviewRecord | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localReviewDb.get(activityId).then((r) => {
      setRecord(r)
      setLoading(false)
    })
  }, [activityId])

  const advance = useCallback(
    async (
      to: ReviewStatus,
      opts: { reviewer?: string; notes?: string } = {},
    ): Promise<{ ok: boolean; error?: string }> => {
      const from = record?.status ?? 'draft'
      const result = validateTransition(from, to, { theology, ...opts })
      if (!result.ok) return result

      const snapshot = theologicalSnapshot(theology)
      const updated = await localReviewDb.transition(activityId, to, { ...opts, snapshot })
      setRecord(updated)
      return { ok: true }
    },
    [activityId, record, theology],
  )

  const checkInvalidation = useCallback(async () => {
    if (!theology) return false
    const snapshot = theologicalSnapshot(theology)
    const invalidated = await localReviewDb.invalidateIfModified(activityId, snapshot)
    if (invalidated) {
      const updated = await localReviewDb.get(activityId)
      setRecord(updated)
    }
    return invalidated
  }, [activityId, theology])

  const currentStatus: ReviewStatus = record?.status ?? 'draft'

  return {
    record,
    loading,
    currentStatus,
    advance,
    checkInvalidation,
  }
}
