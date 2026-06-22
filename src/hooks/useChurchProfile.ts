import { useState, useEffect, useCallback } from 'react'
import type { ChurchProfile } from '@/types'
import { churchProfileDb, DEFAULT_CHURCH_PROFILE } from '@/db'

export function useChurchProfile() {
  const [profile, setProfile] = useState<ChurchProfile>({ ...DEFAULT_CHURCH_PROFILE })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    churchProfileDb.get().then((p) => {
      setProfile(p)
      setLoading(false)
    })
  }, [])

  const save = useCallback(async (updated: ChurchProfile) => {
    await churchProfileDb.save(updated)
    setProfile(updated)
  }, [])

  const deleteProfile = useCallback(async () => {
    await churchProfileDb.delete()
    setProfile({ ...DEFAULT_CHURCH_PROFILE })
  }, [])

  const exportProfile = useCallback(async (): Promise<ChurchProfile> => {
    return churchProfileDb.export()
  }, [])

  const importProfile = useCallback(async (data: ChurchProfile) => {
    await churchProfileDb.import(data)
    setProfile(data)
  }, [])

  const approveActivity = useCallback(async (id: string) => {
    await churchProfileDb.approveActivity(id)
    setProfile((prev) => ({
      ...prev,
      approvedActivities: prev.approvedActivities.includes(id)
        ? prev.approvedActivities
        : [...prev.approvedActivities, id],
    }))
  }, [])

  const revokeActivity = useCallback(async (id: string) => {
    await churchProfileDb.revokeActivity(id)
    setProfile((prev) => ({
      ...prev,
      approvedActivities: prev.approvedActivities.filter((a) => a !== id),
    }))
  }, [])

  return {
    profile,
    loading,
    save,
    deleteProfile,
    exportProfile,
    importProfile,
    approveActivity,
    revokeActivity,
  }
}

// Default terms used when no custom term is configured
export const DEFAULT_TERMS: Record<string, string> = {
  'escola-dominical': 'Escola dominical',
  culto: 'Culto',
  pastor: 'Pastor',
  'ministerio-infantil': 'Ministério infantil',
  lider: 'Líder',
}

export function useChurchTerms(profile: ChurchProfile) {
  return {
    getTerm: (key: string): string => profile.customTerms[key] ?? DEFAULT_TERMS[key] ?? key,
  }
}
