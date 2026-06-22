import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useActivityById } from '@/hooks/useActivities'
import { useFavorites, useCompleted, useNote } from '@/hooks/useLocalState'
import { AppHeader } from '@/components/AppHeader'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'

const typeLabel: Record<string, string> = {
  jogo: 'Jogo', reflexao: 'Reflexão', arte: 'Arte', teatro: 'Teatro',
  musica: 'Música', experimento: 'Experimento', oracao: 'Oração', 'quebra-gelo': 'Quebra-gelo',
}
const diffLabel: Record<string, string> = { facil: 'Fácil', medio: 'Médio', avancado: 'Avançado' }
const ageLabel: Record<string, string> = { '3-5': '3–5 anos', '6-8': '6–8 anos', '9-11': '9–11 anos', '12-14': '12–14 anos' }

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const activity = useActivityById(id ?? '')
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const { completed, toggle: toggleCompleted } = useCompleted()
  const { note, save: saveNote } = useNote(id ?? '')
  const [classMode, setClassMode] = useState(false)

  if (!activity) {
    return (
      <div className="page-container">
        <AppHeader title="Dinâmica" showBack />
        <EmptyState icon="😕" title="Dinâmica não encontrada" description="Essa dinâmica não existe ou foi removida." />
      </div>
    )
  }

  const isFav = favorites.has(activity.id)
  const isDone = completed.has(activity.id)

  if (classMode) {
    return (
      <div className="page-container bg-white">
        <div className="flex items-center justify-between px-4 pt-10 pb-4 border-b border-slate-100">
          <h1 className="text-lg font-extrabold text-slate-800 flex-1 pr-3">{activity.title}</h1>
          <button
            onClick={() => setClassMode(false)}
            className="text-xs font-bold text-primary-600 border-2 border-primary-200 px-3 py-1.5 rounded-lg"
          >
            Sair do modo aula
          </button>
        </div>
        <div className="px-4 pt-5 pb-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Passo a passo</p>
          <ol className="space-y-4">
            {activity.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 font-extrabold
                                 flex items-center justify-center flex-shrink-0 text-base">
                  {i + 1}
                </span>
                <p className="text-base text-slate-700 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
          {activity.memoryVerse && (
            <div className="mt-8 bg-primary-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-primary-600 mb-1">Versículo para memorizar</p>
              <p className="text-sm text-primary-800 font-medium leading-relaxed">{activity.memoryVerse}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <AppHeader title={activity.title} showBack />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="type">{typeLabel[activity.type]}</Badge>
          <Badge variant="duration">⏱ {activity.durationMinutes} min</Badge>
          <Badge variant="difficulty">{diffLabel[activity.difficulty]}</Badge>
          {activity.ageGroups.map((age) => (
            <Badge key={age} variant="age">{ageLabel[age]}</Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => toggleFavorite(activity.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors
              ${isFav ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}
          >
            {isFav ? '★ Favoritada' : '☆ Favoritar'}
          </button>
          <button
            onClick={() => toggleCompleted(activity.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors flex-1 justify-center
              ${isDone ? 'border-secondary-400 bg-secondary-50 text-secondary-700' : 'border-slate-200 text-slate-500'}`}
          >
            {isDone ? '✓ Concluída' : 'Marcar como concluída'}
          </button>
          <button
            onClick={() => setClassMode(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border-2 border-primary-200 text-primary-600"
            title="Modo aula"
          >
            📋
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-600 leading-relaxed">{activity.summary}</p>

        {/* Bible reference */}
        <div className="bg-primary-50 border-l-4 border-primary-400 rounded-r-2xl px-4 py-3">
          <p className="text-xs font-bold text-primary-600 mb-0.5">Referência Bíblica</p>
          <p className="text-sm font-bold text-primary-800">{activity.bibleReference}</p>
          <p className="text-xs text-primary-700 mt-1 leading-relaxed">{activity.mainTruth}</p>
        </div>

        {/* Objective */}
        <Section title="Objetivo">
          <p className="text-sm text-slate-600 leading-relaxed">{activity.objective}</p>
        </Section>

        {/* Materials */}
        {activity.materials.length > 0 && (
          <Section title="Materiais necessários">
            <div className="flex flex-wrap gap-1.5">
              {activity.materials.map((m, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {m}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Preparation */}
        {activity.preparation.length > 0 && (
          <Section title="Preparação antes da aula">
            <ul className="space-y-1.5">
              {activity.preparation.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-primary-400 mt-0.5">•</span>{p}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Steps */}
        <Section title="Passo a passo">
          <ol className="space-y-3">
            {activity.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 text-[0.65rem] font-extrabold
                                 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Section>

        {/* Discussion */}
        {activity.discussionQuestions.length > 0 && (
          <Section title="Perguntas para conversar">
            <ul className="space-y-2">
              {activity.discussionQuestions.map((q, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="text-primary-400 font-bold">{i + 1}.</span>{q}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Prayer */}
        {activity.prayerSuggestion && (
          <Section title="Sugestão de oração">
            <p className="text-sm text-slate-600 italic leading-relaxed">"{activity.prayerSuggestion}"</p>
          </Section>
        )}

        {/* Memory verse */}
        {activity.memoryVerse && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-secondary-700 mb-1">📖 Versículo para memorizar</p>
            <p className="text-sm text-secondary-800 font-medium leading-relaxed">{activity.memoryVerse}</p>
          </div>
        )}

        {/* Adaptations */}
        {(activity.youngerAdaptation || activity.olderAdaptation || activity.noMaterialsAlternative) && (
          <Section title="Adaptações">
            {activity.youngerAdaptation && (
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-400 mb-0.5">Para crianças menores</p>
                <p className="text-sm text-slate-600">{activity.youngerAdaptation}</p>
              </div>
            )}
            {activity.olderAdaptation && (
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-400 mb-0.5">Para crianças maiores</p>
                <p className="text-sm text-slate-600">{activity.olderAdaptation}</p>
              </div>
            )}
            {activity.noMaterialsAlternative && (
              <div>
                <p className="text-xs font-bold text-slate-400 mb-0.5">Sem materiais</p>
                <p className="text-sm text-slate-600">{activity.noMaterialsAlternative}</p>
              </div>
            )}
          </Section>
        )}

        {/* Safety */}
        {activity.safetyNotes.length > 0 && (
          <div className="bg-warm-50 border border-warm-200 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-orange-700 mb-1">⚠️ Cuidados e segurança</p>
            <ul className="space-y-1">
              {activity.safetyNotes.map((n, i) => (
                <li key={i} className="text-sm text-orange-800 flex gap-2">
                  <span>•</span>{n}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <Section title="Minhas anotações">
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            placeholder="Escreva suas observações sobre essa dinâmica..."
            rows={4}
            className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm text-slate-700
                       placeholder-slate-300 outline-none focus:border-primary-400 resize-y
                       transition-colors"
          />
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  )
}
