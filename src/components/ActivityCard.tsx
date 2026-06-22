import { useState } from 'react'
import type { Activity } from '@/types'
import { Badge } from './Badge'

const typeLabel: Record<Activity['type'], string> = {
  jogo: 'Jogo',
  reflexao: 'Reflexão',
  arte: 'Arte',
  teatro: 'Teatro',
  musica: 'Música',
  experimento: 'Experimento',
  oracao: 'Oração',
  'quebra-gelo': 'Quebra-gelo',
}

const diffLabel: Record<Activity['difficulty'], string> = {
  facil: 'Fácil',
  medio: 'Médio',
  avancado: 'Avançado',
}

interface ActivityCardProps {
  activity: Activity
  index: number
  isFavorite?: boolean
  isCompleted?: boolean
  onToggleFavorite?: () => void
  onToggleCompleted?: () => void
  onClick?: () => void
}

export function ActivityCard({
  activity,
  index,
  isFavorite = false,
  isCompleted = false,
  onToggleFavorite,
  onToggleCompleted,
  onClick,
}: ActivityCardProps) {
  const [open, setOpen] = useState(false)

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      setOpen((o) => !o)
    }
  }

  return (
    <div className={`card overflow-hidden transition-all ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Header */}
      <button
        onClick={handleCardClick}
        className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 text-xs font-extrabold
                        flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-snug">{activity.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="type">{typeLabel[activity.type]}</Badge>
            <Badge variant="duration">⏱ {activity.durationMinutes} min</Badge>
            <Badge variant="difficulty">{diffLabel[activity.difficulty]}</Badge>
          </div>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-300 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable body (inline mode) */}
      {!onClick && open && (
        <div className="border-t border-slate-100 px-4 pb-5">
          {/* Bible reference */}
          <div className="mt-4 bg-primary-50 border-l-4 border-primary-400 rounded-r-xl p-3">
            <p className="text-xs font-bold text-primary-700 mb-0.5">Referência Bíblica</p>
            <p className="text-sm text-primary-800 font-medium">{activity.bibleReference}</p>
          </div>

          {/* Objective */}
          <div className="mt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Objetivo</p>
            <p className="text-sm text-slate-600 leading-relaxed">{activity.objective}</p>
          </div>

          {/* Steps */}
          <div className="mt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Passo a passo</p>
            <ol className="space-y-2">
              {activity.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-primary-100 text-primary-600 text-[0.65rem]
                                   font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                            border-2 transition-colors
                            ${isFavorite ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}
              >
                {isFavorite ? '★ Favorita' : '☆ Favoritar'}
              </button>
            )}
            {onToggleCompleted && (
              <button
                onClick={onToggleCompleted}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                            border-2 transition-colors flex-1 justify-center
                            ${isCompleted ? 'border-secondary-400 bg-secondary-50 text-secondary-700' : 'border-slate-200 text-slate-500'}`}
              >
                {isCompleted ? '✓ Concluída' : 'Marcar concluída'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
