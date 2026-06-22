import { z } from 'zod'

const BackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  favorites: z.array(z.string()),
  completed: z.array(z.string()),
  notes: z.record(z.string(), z.string()),
  settings: z.record(z.string(), z.unknown()),
})

export type Backup = z.infer<typeof BackupSchema>

export function exportBackup(data: Omit<Backup, 'version' | 'exportedAt'>): string {
  const backup: Backup = { version: 1, exportedAt: new Date().toISOString(), ...data }
  return JSON.stringify(backup, null, 2)
}

export function importBackup(raw: string): Backup {
  const parsed = JSON.parse(raw)
  return BackupSchema.parse(parsed)
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
