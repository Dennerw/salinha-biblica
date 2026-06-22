import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSafePlanner } from '@/hooks/useSafePlanner'
import { lessonsDb } from '@/db'
import { AppHeader } from '@/components/AppHeader'
import type { AgeGroup, GroupSize, Environment, LessonPlan, LessonStep } from '@/types'

const STEP_LABELS = [
  { label: 'Recepção / Quebra-gelo', duration: 10 },
  { label: 'Introdução do tema', duration: 5 },
  { label: 'Dinâmica principal', duration: 25 },
  { label: 'Perguntas para conversa', duration: 5 },
  { label: 'Versículo para memorizar', duration: 5 },
  { label: 'Oração final', duration: 5 },
]

function generateId() {
  return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function LessonPlannerPage() {
  const navigate = useNavigate()
  const { safeActivities, excludedCount, isDenominational, getReviewVersion, loading } =
    useSafePlanner()

  const [form, setForm] = useState({
    title: '',
    ageGroup: '6-8' as AgeGroup,
    groupSize: '6-10' as GroupSize,
    theme: '',
    totalDuration: 60,
    environment: 'sala' as Environment,
  })
  const [steps, setSteps] = useState<LessonStep[] | null>(null)
  const [mainActivityId, setMainActivityId] = useState<string | null>(null)
  const [observations, setObservations] = useState('')
  const [saved, setSaved] = useState(false)

  function buildPlan() {
    // Select a main activity from safe-only pool
    const main = safeActivities.find(
      (a) =>
        a.ageGroups.includes(form.ageGroup) &&
        a.environment.includes(form.environment) &&
        a.durationMinutes <= Math.floor(form.totalDuration * 0.5) &&
        (!form.theme ||
          a.themes.some((t) => t.toLowerCase().includes(form.theme.toLowerCase())) ||
          a.tags.some((t) => t.toLowerCase().includes(form.theme.toLowerCase()))),
    )

    setMainActivityId(main?.id ?? null)

    const generatedSteps: LessonStep[] = STEP_LABELS.map((s, i) => {
      const isMainStep = i === 2 && !!main
      return {
        activityId: isMainStep ? main!.id : null,
        label: isMainStep ? `${s.label}: ${main!.title}` : s.label,
        durationMinutes: s.duration,
        notes: '',
        reviewVersion: isMainStep ? getReviewVersion(main!.id) : undefined,
        theologicalRisk: isMainStep ? (main!.theology?.risk ?? 'low') : undefined,
      }
    })
    setSteps(generatedSteps)
  }

  async function handleSave() {
    if (!steps) return
    const plan: LessonPlan = {
      id: generateId(),
      title: form.title || `Encontro — ${new Date().toLocaleDateString('pt-BR')}`,
      ageGroup: form.ageGroup,
      groupSize: form.groupSize,
      theme: form.theme,
      totalDurationMinutes: form.totalDuration,
      environment: form.environment,
      steps,
      observations,
      createdAt: new Date(),
      completedAt: null,
    }
    await lessonsDb.save(plan)
    setSaved(true)
    setTimeout(() => navigate('/encontros'), 1200)
  }

  const totalMin = steps ? steps.reduce((s, st) => s + st.durationMinutes, 0) : 0
  const mainActivity = mainActivityId ? safeActivities.find((a) => a.id === mainActivityId) : null
  const showDenominationalWarning = mainActivity ? isDenominational(mainActivity) : false

  return (
    <div className="page-container">
      <AppHeader title="Montar Encontro" subtitle="Roteiro sugerido automaticamente" />

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">

        {/* Safety notice — shown when high-risk activities were excluded */}
        {!loading && excludedCount > 0 && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3"
               role="note" aria-label="Aviso de segurança de conteúdo">
            <span className="text-lg flex-shrink-0" aria-hidden>⚑</span>
            <div>
              <p className="text-xs font-bold text-amber-700">
                {excludedCount} {excludedCount === 1 ? 'dinâmica excluída' : 'dinâmicas excluídas'} por risco teológico alto
              </p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                Conteúdo de risco alto não aprovado localmente não aparece nos roteiros sugeridos.
                Aprove-o no Painel de Revisão (Configurações) para incluir.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card p-4 flex flex-col gap-3">
          <h2 className="font-bold text-slate-700 text-sm">Detalhes do encontro</h2>

          <div>
            <label className="label-xs">Título (opcional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex.: Encontro de Páscoa"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs">Faixa etária</label>
              <select
                value={form.ageGroup}
                onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value as AgeGroup }))}
                className="input-field"
              >
                <option value="3-5">3–5 anos</option>
                <option value="6-8">6–8 anos</option>
                <option value="9-11">9–11 anos</option>
                <option value="12-14">12–14 anos</option>
              </select>
            </div>
            <div>
              <label className="label-xs">Quantidade</label>
              <select
                value={form.groupSize}
                onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value as GroupSize }))}
                className="input-field"
              >
                <option value="1-5">1–5 crianças</option>
                <option value="6-10">6–10 crianças</option>
                <option value="11-20">11–20 crianças</option>
                <option value="21+">21+ crianças</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs">Tema (opcional)</label>
              <input
                type="text"
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                placeholder="Ex.: perdão, Davi..."
                className="input-field"
              />
            </div>
            <div>
              <label className="label-xs">Duração total</label>
              <select
                value={form.totalDuration}
                onChange={(e) => setForm((f) => ({ ...f, totalDuration: Number(e.target.value) }))}
                className="input-field"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-xs">Ambiente</label>
            <select
              value={form.environment}
              onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value as Environment }))}
              className="input-field"
            >
              <option value="sala">Sala pequena</option>
              <option value="salao">Salão</option>
              <option value="externo">Área externa</option>
              <option value="qualquer">Qualquer espaço</option>
            </select>
          </div>

          <button
            onClick={buildPlan}
            disabled={loading}
            className="btn-primary text-sm mt-1 disabled:opacity-50"
          >
            🗓️ Gerar roteiro
          </button>
        </div>

        {/* Generated steps */}
        {steps && (
          <>
            {/* Denominational content warning */}
            {showDenominationalWarning && (
              <div
                className="flex gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3"
                role="note"
                aria-label="Aviso de conteúdo denominacional"
              >
                <span className="text-lg flex-shrink-0" aria-hidden>📋</span>
                <div>
                  <p className="text-xs font-bold text-blue-700">Conteúdo denominacional selecionado</p>
                  <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                    A dinâmica principal contém elementos com interpretações específicas por
                    denominação. Revise com o responsável pastoral antes de usar.
                    {mainActivity?.theology?.doctrinalNotice && (
                      <span className="block mt-1 italic">"{mainActivity.theology.doctrinalNotice}"</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-700 text-sm">Roteiro sugerido</h2>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                  ⏱ {totalMin} min
                </span>
              </div>
              <ol className="space-y-2.5">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-3">
                    <span
                      className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 text-xs font-extrabold
                                 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{step.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-400">{step.durationMinutes} min</p>
                        {step.reviewVersion !== undefined && (
                          <span
                            className="text-[0.6rem] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                            aria-label={`Versão de revisão ${step.reviewVersion}`}
                            title={`Revisão v${step.reviewVersion} registrada no momento do planejamento`}
                          >
                            rev v{step.reviewVersion}
                          </span>
                        )}
                        {step.theologicalRisk === 'denominational' && (
                          <span
                            className="text-[0.6rem] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"
                            aria-label="Conteúdo denominacional"
                          >
                            denominacional
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-4">
              <label className="label-xs block mb-2">Observações gerais</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Anote aqui qualquer detalhe importante..."
                rows={3}
                className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm text-slate-700
                           placeholder-slate-300 outline-none focus:border-primary-400 resize-y transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              className={`btn-primary text-sm transition-colors ${saved ? '!bg-secondary-500' : ''}`}
            >
              {saved ? '✓ Salvo!' : '💾 Salvar encontro'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
