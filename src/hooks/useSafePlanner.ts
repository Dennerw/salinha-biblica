import { useState, useEffect, useMemo } from 'react'
import { localReviewDb } from '@/db'
import { useChurchProfile } from '@/hooks/useChurchProfile'
import { useActivities } from '@/hooks/useActivities'
import type { Activity } from '@/types'
import type { LocalReviewRecord } from '@/db'

export interface SafePlannerData {
  /** Activities safe to use in lesson planning (no unapproved high-risk content) */
  safeActivities: Activity[]
  /** All activities, for reference */
  allActivities: Activity[]
  /** How many activities were filtered out due to unapproved high-risk */
  excludedCount: number
  /** Whether a given activity is safe for use */
  isSafe: (activity: Activity) => boolean
  /** Whether a given activity carries a denominational-level notice */
  isDenominational: (activity: Activity) => boolean
  /** Review version recorded for a given activity (for provenance tracking) */
  getReviewVersion: (activityId: string) => number
  loading: boolean
}

export function useSafePlanner(): SafePlannerData {
  const { activities: allActivities } = useActivities()
  const { profile, loading: profileLoading } = useChurchProfile()
  const [reviewRecords, setReviewRecords] = useState<Record<string, LocalReviewRecord>>({})
  const [recordsLoading, setRecordsLoading] = useState(true)

  useEffect(() => {
    localReviewDb.getAll().then((rows) => {
      const map: Record<string, LocalReviewRecord> = {}
      rows.forEach((r) => { map[r.activityId] = r })
      setReviewRecords(map)
      setRecordsLoading(false)
    })
  }, [])

  const approvedSet = useMemo(
    () => new Set(profile.approvedActivities),
    [profile.approvedActivities],
  )

  const isSafe = useMemo(() => (activity: Activity): boolean => {
    // No theology or low/medium risk — always safe
    if (!activity.theology || activity.theology.risk !== 'high') return true
    // High risk: must be locally approved via church profile OR review record
    if (approvedSet.has(activity.id)) return true
    if (reviewRecords[activity.id]?.status === 'approved') return true
    return false
  }, [approvedSet, reviewRecords])

  const isDenominational = useMemo(() => (activity: Activity): boolean => {
    return activity.theology?.level === 'denominational'
  }, [])

  const getReviewVersion = useMemo(() => (activityId: string): number => {
    return reviewRecords[activityId]?.version ?? 1
  }, [reviewRecords])

  const safeActivities = useMemo(
    () => allActivities.filter(isSafe),
    [allActivities, isSafe],
  )

  const excludedCount = allActivities.length - safeActivities.length

  return {
    safeActivities,
    allActivities,
    excludedCount,
    isSafe,
    isDenominational,
    getReviewVersion,
    loading: profileLoading || recordsLoading,
  }
}
