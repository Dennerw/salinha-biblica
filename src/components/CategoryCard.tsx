import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  count: number
  completed: number
  onClick: () => void
}

export function CategoryCard({ category, count, completed, onClick }: CategoryCardProps) {
  const pct = count > 0 ? Math.round((completed / count) * 100) : 0

  return (
    <button
      onClick={onClick}
      className="card w-full flex items-center gap-4 px-4 py-4 text-left
                 active:scale-[0.98] transition-transform"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: category.color + '22' }}
      >
        {category.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm leading-tight truncate">{category.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {count} dinâmicas · {completed} concluídas
        </p>
        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: category.color }}
          />
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
        className="text-slate-300 flex-shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
