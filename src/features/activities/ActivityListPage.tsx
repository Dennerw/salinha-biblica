import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useActivities } from '@/hooks/useActivities'
import { useSearch } from '@/hooks/useSearch'
import { useFavorites, useCompleted } from '@/hooks/useLocalState'
import { useFiltersStore } from '@/store'
import { AppHeader } from '@/components/AppHeader'
import { SearchInput } from '@/components/SearchInput'
import { ActivityCard } from '@/components/ActivityCard'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar } from './FilterBar'
import { useNavigate } from 'react-router-dom'

export function ActivityListPage() {
  const { activities } = useActivities()
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const { completed, toggle: toggleCompleted } = useCompleted()
  const { filters, setSearch, hasActiveFilters } = useFiltersStore()
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Apply category param from home navigation
  const categoryParam = searchParams.get('categoria')
  const activitiesToShow = categoryParam
    ? activities.filter((a) => a.category === categoryParam)
    : activities

  const filtered = useSearch(activitiesToShow, filters)

  // Sync search param on mount
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle = categoryParam
    ? `${filtered.length} de ${activitiesToShow.length} dinâmicas`
    : `${filtered.length} de ${activities.length} dinâmicas`

  return (
    <div className="page-container">
      <AppHeader
        title="Explorar"
        subtitle={subtitle}
        action={
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-2 rounded-xl transition-colors
              ${showFilters ? 'bg-white/30' : 'bg-white/15'}`}
            aria-label="Filtros"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {hasActiveFilters() && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-primary-600" />
            )}
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-4">
        <SearchInput value={filters.search} onChange={setSearch} />

        {showFilters && (
          <div className="card p-4">
            <FilterBar />
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nenhuma dinâmica encontrada"
            description="Tente outros termos ou remova alguns filtros."
            action={
              hasActiveFilters() ? (
                <button
                  onClick={() => useFiltersStore.getState().resetFilters()}
                  className="btn-primary text-sm"
                >
                  Limpar filtros
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((activity, i) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={i}
                isFavorite={favorites.has(activity.id)}
                isCompleted={completed.has(activity.id)}
                onToggleFavorite={() => toggleFavorite(activity.id)}
                onToggleCompleted={() => toggleCompleted(activity.id)}
                onClick={() => navigate(`/explorar/${activity.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
