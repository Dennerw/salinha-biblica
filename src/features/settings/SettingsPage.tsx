import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { settingsDb, backupDb } from '@/db'
import { exportBackup, importBackup, downloadJson } from '@/utils/backup'
import type { AppSettings } from '@/types'
import { ChurchProfileSection } from './ChurchProfileSection'
import { ReviewPanel } from './ReviewPanel'

const defaultSettings: AppSettings = {
  teacherName: '',
  churchName: '',
  primaryAgeGroup: '',
  bibleVersion: 'NVI',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [importError, setImportError] = useState('')

  useEffect(() => {
    settingsDb.get().then(setSettings)
  }, [])

  async function handleSave() {
    await settingsDb.save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const data = await backupDb.export()
    const json = exportBackup({
      favorites: data.favorites,
      completed: data.completed,
      notes: data.notes,
      settings: data.settings as unknown as Record<string, unknown>,
    })
    downloadJson(`salinha-biblica-backup-${new Date().toISOString().slice(0, 10)}.json`, json)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const backup = importBackup(ev.target?.result as string)
        await backupDb.import({
          favorites: backup.favorites,
          completed: backup.completed,
          notes: backup.notes as Record<string, string>,
          settings: backup.settings,
        })
        setImportError('')
        alert('Backup importado com sucesso!')
      } catch {
        setImportError('Arquivo inválido. Certifique-se de usar um backup gerado por este aplicativo.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function update(partial: Partial<AppSettings>) {
    setSettings((s) => ({ ...s, ...partial }))
  }

  return (
    <div className="page-container">
      <AppHeader title="Meu Perfil" subtitle="Configurações e backup" />

      <div className="flex flex-col gap-5 px-4 pt-5 pb-10">
        {/* Profile card */}
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">
              ✝️
            </div>
            <div>
              <p className="font-bold text-slate-700">{settings.teacherName || 'Professor(a)'}</p>
              <p className="text-sm text-slate-400">{settings.churchName || 'Ministério Infantil'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Field label="Seu nome">
              <input
                type="text"
                value={settings.teacherName}
                onChange={(e) => update({ teacherName: e.target.value })}
                placeholder="Nome do professor(a)"
                className="input-field"
              />
            </Field>
            <Field label="Igreja">
              <input
                type="text"
                value={settings.churchName}
                onChange={(e) => update({ churchName: e.target.value })}
                placeholder="Nome da sua igreja"
                className="input-field"
              />
            </Field>
            <Field label="Faixa etária principal">
              <select
                value={settings.primaryAgeGroup}
                onChange={(e) => update({ primaryAgeGroup: e.target.value as AppSettings['primaryAgeGroup'] })}
                className="input-field"
              >
                <option value="">Todas as idades</option>
                <option value="3-5">3–5 anos</option>
                <option value="6-8">6–8 anos</option>
                <option value="9-11">9–11 anos</option>
                <option value="12-14">12–14 anos</option>
              </select>
            </Field>
          </div>

          <button
            onClick={handleSave}
            className={`mt-4 w-full py-3 rounded-xl font-bold text-sm transition-colors
              ${saved ? 'bg-secondary-500 text-white' : 'bg-primary-500 text-white'}`}
          >
            {saved ? '✓ Salvo!' : 'Salvar'}
          </button>
        </div>

        {/* Backup */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-700 mb-1">Backup de dados</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Seus favoritos, anotações e progresso ficam salvo neste dispositivo. Exporte para guardar uma cópia.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={handleExport} className="btn-primary text-sm">
              📤 Exportar backup
            </button>
            <label className="btn-secondary text-sm text-center cursor-pointer">
              📥 Importar backup
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          {importError && (
            <p className="mt-2 text-xs text-red-500 leading-relaxed">{importError}</p>
          )}
        </div>

        {/* Church profile */}
        <ChurchProfileSection />

        {/* Review panel */}
        <ReviewPanel />

        {/* App info */}
        <div className="card p-5 text-center">
          <p className="text-2xl mb-2">📖</p>
          <p className="font-bold text-slate-700">Salinha Bíblica</p>
          <p className="text-xs text-slate-400 mt-1">Dinâmicas para ministério infantil · v0.1.0</p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}
