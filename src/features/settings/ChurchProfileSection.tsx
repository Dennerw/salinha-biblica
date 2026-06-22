import { useState } from 'react'
import type { ChurchProfile, ChurchConfigMode, AgeGroup } from '@/types'
import { HIGH_RISK_TAGS } from '@/schemas/activity'
import { useChurchProfile, DEFAULT_TERMS } from '@/hooks/useChurchProfile'
import { downloadJson } from '@/utils/backup'

const DENOMINATIONAL_MODULE_LABELS: Record<string, string> = {
  batismo: 'Batismo',
  ceia: 'Ceia do Senhor',
  'dons-espirituais': 'Dons espirituais',
  linguas: 'Línguas',
  profecia: 'Profecia',
  cura: 'Cura e saúde',
  predestinacao: 'Predestinação',
  'livre-arbitrio': 'Livre-arbítrio',
  'seguranca-da-salvacao': 'Segurança da salvação',
  'governo-da-igreja': 'Governo da igreja',
  ordenacao: 'Ordenação ministerial',
  sabado: 'Sábado e domingo',
  dizimos: 'Dízimos e ofertas',
  prosperidade: 'Prosperidade',
  escatologia: 'Escatologia',
  'usos-e-costumes': 'Usos e costumes',
}

const MODE_CONFIG: Record<ChurchConfigMode, { label: string; description: string }> = {
  basic: {
    label: 'Modo básico',
    description: 'Apenas conteúdo essencial. Temas denominacionais ficam ocultos.',
  },
  custom: {
    label: 'Modo personalizado',
    description: 'Escolha quais módulos denominacionais habilitar e personalize os termos.',
  },
  pastoral_review: {
    label: 'Revisão pastoral',
    description: 'Temas denominacionais ficam visíveis apenas em modo de revisão, aguardando aprovação da liderança.',
  },
}

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: '3-5', label: '3–5 anos' },
  { value: '6-8', label: '6–8 anos' },
  { value: '9-11', label: '9–11 anos' },
  { value: '12-14', label: '12–14 anos' },
]

export function ChurchProfileSection() {
  const { profile, loading, save, deleteProfile, exportProfile, importProfile } = useChurchProfile()
  const [draft, setDraft] = useState<ChurchProfile | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [importError, setImportError] = useState('')

  const current = draft ?? profile

  function update(partial: Partial<ChurchProfile>) {
    setDraft({ ...(draft ?? profile), ...partial })
  }

  function toggleModule(mod: string) {
    const has = current.enabledDenominationalModules.includes(mod)
    update({
      enabledDenominationalModules: has
        ? current.enabledDenominationalModules.filter((m) => m !== mod)
        : [...current.enabledDenominationalModules, mod],
    })
  }

  function toggleAge(age: AgeGroup) {
    const has = current.preferredAgeGroups.includes(age)
    update({
      preferredAgeGroups: has
        ? current.preferredAgeGroups.filter((a) => a !== age)
        : [...current.preferredAgeGroups, age],
    })
  }

  function updateTerm(key: string, value: string) {
    update({ customTerms: { ...current.customTerms, [key]: value } })
  }

  async function handleSave() {
    await save(current)
    setDraft(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const data = await exportProfile()
    downloadJson(
      `salinha-biblica-perfil-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ version: 1, type: 'church-profile', exportedAt: new Date().toISOString(), profile: data }, null, 2),
    )
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        if (raw.type !== 'church-profile' || !raw.profile) throw new Error('Formato inválido')
        await importProfile(raw.profile as ChurchProfile)
        setDraft(null)
        setImportError('')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch {
        setImportError('Arquivo inválido. Use um backup de perfil gerado por este aplicativo.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleDelete() {
    await deleteProfile()
    setDraft(null)
    setDeleteConfirm(false)
  }

  if (loading) return null

  return (
    <div className="card p-5 flex flex-col gap-5">
      <div>
        <h2 className="font-bold text-slate-700 text-base">Perfil da Igreja</h2>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          Opcional. Adapta termos e controla quais temas denominacionais ficam visíveis.
          Tudo salvo apenas neste dispositivo.
        </p>
      </div>

      {/* Mode selector */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
          Modo de configuração
        </legend>
        <div className="flex flex-col gap-2">
          {(Object.entries(MODE_CONFIG) as [ChurchConfigMode, { label: string; description: string }][]).map(
            ([mode, cfg]) => (
              <label
                key={mode}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors
                  ${current.configMode === mode
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-slate-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name="configMode"
                  value={mode}
                  checked={current.configMode === mode}
                  onChange={() => update({ configMode: mode })}
                  className="mt-0.5 accent-primary-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{cfg.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cfg.description}</p>
                </div>
              </label>
            ),
          )}
        </div>
      </fieldset>

      {/* Basic info */}
      <div className="flex flex-col gap-3">
        <Field label="Nome do ministério">
          <input
            type="text"
            value={current.ministryName}
            onChange={(e) => update({ ministryName: e.target.value })}
            placeholder="ex: Ministério Infantil Laços de Amor"
            className="input-field"
          />
        </Field>
        <Field label="Nome da igreja">
          <input
            type="text"
            value={current.churchName}
            onChange={(e) => update({ churchName: e.target.value })}
            placeholder="Nome da sua igreja"
            className="input-field"
          />
        </Field>
        <Field label="Tradução bíblica utilizada">
          <input
            type="text"
            value={current.bibleVersion}
            onChange={(e) => update({ bibleVersion: e.target.value })}
            placeholder="ex: NVI, ARC, NAA"
            className="input-field"
          />
        </Field>
        <Field label="Faixas etárias atendidas">
          <div className="flex gap-2 flex-wrap mt-1">
            {AGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleAge(o.value)}
                className={`filter-chip ${current.preferredAgeGroups.includes(o.value) ? 'filter-chip-active' : ''}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* Pastoral approver — only for pastoral_review mode */}
      {current.configMode === 'pastoral_review' && (
        <Field label="Responsável pela aprovação pastoral">
          <input
            type="text"
            value={current.pastoralApproverName}
            onChange={(e) => update({ pastoralApproverName: e.target.value })}
            placeholder="ex: Pastor(a) responsável pelo ministério"
            className="input-field"
          />
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Identificação funcional — não insira CPF, e-mail ou dados sensíveis.
          </p>
        </Field>
      )}

      {/* Denominational modules — only for custom / pastoral_review */}
      {current.configMode !== 'basic' && (
        <fieldset>
          <legend className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Módulos denominacionais habilitados
          </legend>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Temas marcados aparecerão no catálogo com aviso.
            {current.configMode === 'pastoral_review' && ' Ainda precisarão de aprovação da liderança antes de entrar no planejamento.'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {HIGH_RISK_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 text-xs cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={current.enabledDenominationalModules.includes(tag)}
                  onChange={() => toggleModule(tag)}
                  className="accent-primary-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700">{DENOMINATIONAL_MODULE_LABELS[tag] ?? tag}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Custom terms */}
      {current.configMode !== 'basic' && (
        <fieldset>
          <legend className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Termos personalizados
          </legend>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Deixe em branco para usar o padrão.
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(DEFAULT_TERMS).map(([key, defaultVal]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-36 flex-shrink-0">{defaultVal}</span>
                <input
                  type="text"
                  value={current.customTerms[key] ?? ''}
                  onChange={(e) => updateTerm(key, e.target.value)}
                  placeholder={defaultVal}
                  className="input-field text-xs py-1.5"
                  aria-label={`Termo personalizado para ${defaultVal}`}
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors
          ${saved ? 'bg-secondary-500 text-white' : 'bg-primary-500 text-white'}`}
      >
        {saved ? '✓ Salvo!' : 'Salvar perfil da igreja'}
      </button>

      {/* Export / Import / Delete */}
      <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dados do perfil</p>
        <button onClick={handleExport} className="btn-secondary text-sm">
          📤 Exportar perfil
        </button>
        <label className="btn-secondary text-sm text-center cursor-pointer">
          📥 Importar perfil
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
        {importError && <p className="text-xs text-red-500 leading-relaxed">{importError}</p>}

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-xs font-semibold text-red-500 underline underline-offset-2 self-start mt-1"
          >
            Apagar perfil da igreja
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-xs text-red-700 font-semibold">
              Isso apagará todas as configurações e aprovações locais. Confirmar?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white text-xs font-bold py-2 rounded-lg"
              >
                Sim, apagar
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 border-2 border-slate-200 text-slate-500 text-xs font-bold py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
