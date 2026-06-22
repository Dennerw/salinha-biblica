import { useState, useEffect } from 'react'
import { useActivities } from '@/hooks/useActivities'
import { localReviewDb, type LocalReviewRecord } from '@/db'
import {
  VALID_TRANSITIONS,
  validateTransition,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_COLOR,
  theologicalSnapshot,
} from '@/utils/review'
import type { ReviewStatus, Activity } from '@/types'

// Combine static activity data with local review record
interface ReviewItem {
  activity: Activity
  record: LocalReviewRecord | undefined
  status: ReviewStatus
}

export function ReviewPanel() {
  const { activities } = useActivities()
  const [records, setRecords] = useState<Record<string, LocalReviewRecord>>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all')
  const [reviewer, setReviewer] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    localReviewDb.getAll().then((rows) => {
      const map: Record<string, LocalReviewRecord> = {}
      rows.forEach((r) => { map[r.activityId] = r })
      setRecords(map)
      setLoading(false)
    })
  }, [])

  const items: ReviewItem[] = activities.map((a) => ({
    activity: a,
    record: records[a.id],
    status: records[a.id]?.status ?? 'draft',
  }))

  const filtered = filterStatus === 'all' ? items : items.filter((i) => i.status === filterStatus)
  const selectedItem = selected ? items.find((i) => i.activity.id === selected) : null

  async function handleTransition(to: ReviewStatus) {
    if (!selectedItem) return
    const { activity, record } = selectedItem
    const from = record?.status ?? 'draft'
    const theology = activity.theology
    const result = validateTransition(from, to, { theology, reviewer, notes })
    if (!result.ok) { setError(result.error ?? 'Erro'); return }

    const snapshot = theologicalSnapshot(theology)
    const updated = await localReviewDb.transition(activity.id, to, { reviewer, notes, snapshot })
    setRecords((prev) => ({ ...prev, [activity.id]: updated }))
    setError('')
    setSuccess(`Status atualizado: ${REVIEW_STATUS_LABEL[to]}`)
    setTimeout(() => setSuccess(''), 2500)
    setNotes('')
  }

  const STATUS_FILTER_OPTIONS: Array<ReviewStatus | 'all'> = [
    'all', 'draft', 'biblical_review', 'pedagogical_review',
    'pastoral_review', 'approved', 'rejected', 'archived',
  ]

  if (loading) return null

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div>
        <h2 className="font-bold text-slate-700 text-base">Painel de Revisão</h2>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          Gerencie o fluxo de aprovação das dinâmicas localmente.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {STATUS_FILTER_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`filter-chip flex-shrink-0 ${filterStatus === s ? 'filter-chip-active' : ''}`}
          >
            {s === 'all' ? 'Todos' : REVIEW_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {filtered.map(({ activity, status }) => (
          <button
            key={activity.id}
            onClick={() => { setSelected(activity.id); setError(''); setNotes('') }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border-2 transition-colors
              ${selected === activity.id ? 'border-primary-400 bg-primary-50' : 'border-slate-100 bg-white'}`}
          >
            <span
              className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${REVIEW_STATUS_COLOR[status]}`}
              aria-label={`Status: ${REVIEW_STATUS_LABEL[status]}`}
            >
              {REVIEW_STATUS_LABEL[status]}
            </span>
            <span className="text-xs text-slate-700 truncate">{activity.title}</span>
            {activity.theology?.risk === 'high' && (
              <span className="text-[0.6rem] text-amber-600 font-bold flex-shrink-0" aria-label="Risco alto">⚑</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Nenhuma dinâmica neste status.</p>
        )}
      </div>

      {/* Detail / transition panel */}
      {selectedItem && (
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div>
            <p className="font-semibold text-sm text-slate-700">{selectedItem.activity.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedItem.record ? `v${selectedItem.record.version} · ` : ''}
              Status atual:{' '}
              <span className={`font-bold px-1.5 py-0.5 rounded text-[0.6rem] ${REVIEW_STATUS_COLOR[selectedItem.status]}`}>
                {REVIEW_STATUS_LABEL[selectedItem.status]}
              </span>
            </p>
          </div>

          {/* History */}
          {selectedItem.record && selectedItem.record.history.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Histórico
              </p>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {[...selectedItem.record.history].reverse().map((h, i) => (
                  <div key={i} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-slate-300 flex-shrink-0">{h.at.slice(0, 10)}</span>
                    <span>
                      {REVIEW_STATUS_LABEL[h.from]} → {REVIEW_STATUS_LABEL[h.to]}
                      {h.reviewer && <span className="text-slate-400"> · {h.reviewer}</span>}
                      {h.notes && <span className="italic"> — {h.notes}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transition form */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
              Responsável
            </label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="ex: Pastor(a) responsável"
              className="input-field text-xs py-1.5"
            />
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas da revisão (obrigatório ao reprovar)"
              rows={2}
              className="input-field text-xs py-1.5 resize-none"
            />
          </div>

          {/* Available transitions */}
          <div className="flex flex-wrap gap-1.5">
            {(VALID_TRANSITIONS[selectedItem.status] ?? []).map((to) => (
              <button
                key={to}
                onClick={() => handleTransition(to)}
                className={`filter-chip text-xs font-semibold
                  ${to === 'approved' ? 'bg-secondary-500 text-white border-secondary-500' : ''}
                  ${to === 'rejected' ? 'bg-red-500 text-white border-red-500' : ''}
                  ${to === 'archived' ? 'bg-slate-400 text-white border-slate-400' : ''}
                `}
              >
                → {REVIEW_STATUS_LABEL[to]}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-500 leading-relaxed" role="alert">{error}</p>}
          {success && <p className="text-xs text-secondary-600 font-semibold" role="status">{success}</p>}
        </div>
      )}
    </div>
  )
}
