import Dexie, { type Table } from 'dexie'
import type { LessonPlan, AppSettings, ChurchProfile, ReviewStatus } from '@/types'
import type { ReviewHistoryEntry, TheologicalSnapshot } from '@/utils/review'

interface FavoriteRecord {
  id: string
  addedAt: Date
}

interface CompletedRecord {
  id: string
  completedAt: Date
}

interface NoteRecord {
  id: string
  text: string
  updatedAt: Date
}

interface SettingRecord {
  key: string
  value: unknown
}

interface ChurchProfileRecord {
  id: 'church'
  profile: ChurchProfile
  updatedAt: Date
}

export interface LocalReviewRecord {
  activityId: string
  status: ReviewStatus
  version: number
  biblicalReviewer?: string
  pedagogicalReviewer?: string
  pastoralApprover?: string
  reviewedAt: string          // ISO 8601
  notes?: string
  theologicalSnapshot?: TheologicalSnapshot
  history: ReviewHistoryEntry[]
}

class SalinhaDB extends Dexie {
  favorites!: Table<FavoriteRecord, string>
  completed!: Table<CompletedRecord, string>
  notes!: Table<NoteRecord, string>
  lessons!: Table<LessonPlan, string>
  settings!: Table<SettingRecord, string>
  churchProfile!: Table<ChurchProfileRecord, string>
  localReview!: Table<LocalReviewRecord, string>

  constructor() {
    super('salinha-biblica')
    this.version(1).stores({
      favorites: 'id, addedAt',
      completed: 'id, completedAt',
      notes: 'id, updatedAt',
      lessons: 'id, createdAt, completedAt',
      settings: 'key',
    })
    this.version(2).stores({
      favorites: 'id, addedAt',
      completed: 'id, completedAt',
      notes: 'id, updatedAt',
      lessons: 'id, createdAt, completedAt',
      settings: 'key',
      churchProfile: 'id',
    })
    this.version(3).stores({
      favorites: 'id, addedAt',
      completed: 'id, completedAt',
      notes: 'id, updatedAt',
      lessons: 'id, createdAt, completedAt',
      settings: 'key',
      churchProfile: 'id',
      localReview: 'activityId, status',
    })
  }
}

export const db = new SalinhaDB()

// --- Favorites ---
export const favoritesDb = {
  async getAll(): Promise<string[]> {
    const rows = await db.favorites.orderBy('addedAt').reverse().toArray()
    return rows.map((r) => r.id)
  },
  async toggle(id: string): Promise<boolean> {
    const existing = await db.favorites.get(id)
    if (existing) {
      await db.favorites.delete(id)
      return false
    }
    await db.favorites.put({ id, addedAt: new Date() })
    return true
  },
  async isFavorite(id: string): Promise<boolean> {
    return (await db.favorites.get(id)) !== undefined
  },
}

// --- Completed ---
export const completedDb = {
  async getAll(): Promise<string[]> {
    const rows = await db.completed.toArray()
    return rows.map((r) => r.id)
  },
  async toggle(id: string): Promise<boolean> {
    const existing = await db.completed.get(id)
    if (existing) {
      await db.completed.delete(id)
      return false
    }
    await db.completed.put({ id, completedAt: new Date() })
    return true
  },
  async isCompleted(id: string): Promise<boolean> {
    return (await db.completed.get(id)) !== undefined
  },
}

// --- Notes ---
export const notesDb = {
  async get(id: string): Promise<string> {
    return (await db.notes.get(id))?.text ?? ''
  },
  async save(id: string, text: string): Promise<void> {
    if (text.trim()) {
      await db.notes.put({ id, text, updatedAt: new Date() })
    } else {
      await db.notes.delete(id)
    }
  },
  async getAll(): Promise<Record<string, string>> {
    const rows = await db.notes.toArray()
    return Object.fromEntries(rows.map((r) => [r.id, r.text]))
  },
}

// --- Lessons ---
export const lessonsDb = {
  async getAll(): Promise<LessonPlan[]> {
    return db.lessons.orderBy('createdAt').reverse().toArray()
  },
  async save(lesson: LessonPlan): Promise<void> {
    await db.lessons.put(lesson)
  },
  async delete(id: string): Promise<void> {
    await db.lessons.delete(id)
  },
  async markCompleted(id: string): Promise<void> {
    await db.lessons.update(id, { completedAt: new Date() })
  },
}

// --- Settings ---
const DEFAULT_SETTINGS: AppSettings = {
  teacherName: '',
  churchName: '',
  primaryAgeGroup: '',
  bibleVersion: 'NVI',
}

export const settingsDb = {
  async get(): Promise<AppSettings> {
    const rows = await db.settings.toArray()
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return { ...DEFAULT_SETTINGS, ...map } as AppSettings
  },
  async save(settings: Partial<AppSettings>): Promise<void> {
    await db.transaction('rw', db.settings, async () => {
      for (const [key, value] of Object.entries(settings)) {
        await db.settings.put({ key, value })
      }
    })
  },
}

// --- Church Profile ---
export const DEFAULT_CHURCH_PROFILE: ChurchProfile = {
  ministryName: '',
  churchName: '',
  bibleVersion: 'NVI',
  preferredAgeGroups: [],
  configMode: 'basic',
  enabledDenominationalModules: [],
  customTerms: {},
  pastoralApproverName: '',
  approvedActivities: [],
}

export const churchProfileDb = {
  async get(): Promise<ChurchProfile> {
    const record = await db.churchProfile.get('church')
    return record?.profile ?? { ...DEFAULT_CHURCH_PROFILE }
  },
  async save(profile: ChurchProfile): Promise<void> {
    await db.churchProfile.put({ id: 'church', profile, updatedAt: new Date() })
  },
  async approveActivity(id: string): Promise<void> {
    const profile = await churchProfileDb.get()
    if (!profile.approvedActivities.includes(id)) {
      profile.approvedActivities = [...profile.approvedActivities, id]
      await churchProfileDb.save(profile)
    }
  },
  async revokeActivity(id: string): Promise<void> {
    const profile = await churchProfileDb.get()
    profile.approvedActivities = profile.approvedActivities.filter((a) => a !== id)
    await churchProfileDb.save(profile)
  },
  async isApproved(id: string): Promise<boolean> {
    const profile = await churchProfileDb.get()
    return profile.approvedActivities.includes(id)
  },
  async delete(): Promise<void> {
    await db.churchProfile.delete('church')
  },
  async export(): Promise<ChurchProfile> {
    return churchProfileDb.get()
  },
  async import(profile: ChurchProfile): Promise<void> {
    await churchProfileDb.save(profile)
  },
}

// --- Local Review ---
export const localReviewDb = {
  async get(activityId: string): Promise<LocalReviewRecord | undefined> {
    return db.localReview.get(activityId)
  },

  async save(record: LocalReviewRecord): Promise<void> {
    await db.localReview.put(record)
  },

  async transition(
    activityId: string,
    to: ReviewStatus,
    opts: { reviewer?: string; notes?: string; snapshot?: TheologicalSnapshot } = {},
  ): Promise<LocalReviewRecord> {
    const existing = await localReviewDb.get(activityId)
    const from: ReviewStatus = existing?.status ?? 'draft'
    const now = new Date().toISOString()

    const historyEntry: ReviewHistoryEntry = {
      from,
      to,
      reviewer: opts.reviewer,
      at: now,
      notes: opts.notes,
    }

    const updated: LocalReviewRecord = {
      activityId,
      status: to,
      version: (existing?.version ?? 0) + 1,
      biblicalReviewer: to === 'biblical_review' ? (opts.reviewer ?? existing?.biblicalReviewer) : existing?.biblicalReviewer,
      pedagogicalReviewer: to === 'pedagogical_review' ? (opts.reviewer ?? existing?.pedagogicalReviewer) : existing?.pedagogicalReviewer,
      pastoralApprover: to === 'pastoral_review' || to === 'approved' ? (opts.reviewer ?? existing?.pastoralApprover) : existing?.pastoralApprover,
      reviewedAt: now,
      notes: opts.notes ?? existing?.notes,
      theologicalSnapshot: opts.snapshot ?? existing?.theologicalSnapshot,
      history: [...(existing?.history ?? []), historyEntry],
    }

    await localReviewDb.save(updated)
    return updated
  },

  // Invalidate approval if theological fields changed
  async invalidateIfModified(activityId: string, currentSnapshot: TheologicalSnapshot): Promise<boolean> {
    const { isTheologicallyModified } = await import('@/utils/review')
    const record = await localReviewDb.get(activityId)
    if (!record || record.status !== 'approved') return false
    if (!record.theologicalSnapshot) return false

    if (isTheologicallyModified(record.theologicalSnapshot, currentSnapshot)) {
      const historyEntry: ReviewHistoryEntry = {
        from: 'approved',
        to: 'biblical_review',
        at: new Date().toISOString(),
        notes: 'Aprovação invalidada por alteração em campos teológicos.',
      }
      await localReviewDb.save({
        ...record,
        status: 'biblical_review',
        version: record.version + 1,
        history: [...record.history, historyEntry],
      })
      return true
    }
    return false
  },

  async getAll(): Promise<LocalReviewRecord[]> {
    return db.localReview.toArray()
  },

  async delete(activityId: string): Promise<void> {
    await db.localReview.delete(activityId)
  },
}

// --- Full backup / restore ---
export const backupDb = {
  async export() {
    const [favorites, completed, notes, settings] = await Promise.all([
      favoritesDb.getAll(),
      completedDb.getAll(),
      notesDb.getAll(),
      settingsDb.get(),
    ])
    return { favorites, completed, notes, settings }
  },
  async import(data: {
    favorites: string[]
    completed: string[]
    notes: Record<string, string>
    settings: Record<string, unknown>
  }): Promise<void> {
    await db.transaction('rw', [db.favorites, db.completed, db.notes, db.settings], async () => {
      await db.favorites.clear()
      await db.completed.clear()
      await db.notes.clear()
      await db.settings.clear()

      await db.favorites.bulkPut(data.favorites.map((id) => ({ id, addedAt: new Date() })))
      await db.completed.bulkPut(data.completed.map((id) => ({ id, completedAt: new Date() })))
      await db.notes.bulkPut(
        Object.entries(data.notes).map(([id, text]) => ({ id, text, updatedAt: new Date() })),
      )
      await db.settings.bulkPut(
        Object.entries(data.settings).map(([key, value]) => ({ key, value })),
      )
    })
  },
}
