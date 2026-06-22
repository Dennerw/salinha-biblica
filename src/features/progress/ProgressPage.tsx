import { useActivities } from '@/hooks/useActivities'
import { useCompleted } from '@/hooks/useLocalState'
import { AppHeader } from '@/components/AppHeader'

export function ProgressPage() {
  const { activities, categories } = useActivities()
  const { completed } = useCompleted()

  const total = activities.length
  const totalDone = completed.size
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0

  return (
    <div className="page-container">
      <AppHeader title="Progresso" subtitle="Seu avanço nas dinâmicas" />

      <div className="flex flex-col gap-4 px-4 pt-5">
        {/* Overall */}
        <div className="card p-5 text-center">
          <p className="text-5xl font-black text-primary-600">{pct}%</p>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {totalDone} de {total} dinâmicas concluídas
          </p>
          <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Per category */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por categoria</h2>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const catActs = activities.filter((a) => a.category === cat.id)
            const catDone = catActs.filter((a) => completed.has(a.id)).length
            const catPct = catActs.length > 0 ? Math.round((catDone / catActs.length) * 100) : 0

            return (
              <div key={cat.id} className="card px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: cat.color + '22' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{cat.name}</p>
                    <p className="text-xs text-slate-400">{catDone}/{catActs.length} concluídas</p>
                  </div>
                  <p className="font-extrabold text-sm" style={{ color: cat.color }}>
                    {catPct}%
                  </p>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${catPct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
