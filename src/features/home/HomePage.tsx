import { useNavigate } from 'react-router-dom'
import { useActivities } from '@/hooks/useActivities'
import { useCompleted } from '@/hooks/useLocalState'
import { CategoryCard } from '@/components/CategoryCard'
import { SearchInput } from '@/components/SearchInput'
import { useFiltersStore } from '@/store'

export function HomePage() {
  const { categories, activities } = useActivities()
  const { completed } = useCompleted()
  const navigate = useNavigate()
  const setSearch = useFiltersStore((s) => s.setSearch)
  const search = useFiltersStore((s) => s.filters.search)

  const totalCompleted = completed.size
  const totalActivities = activities.length

  function handleSearch(value: string) {
    setSearch(value)
    if (value) navigate('/explorar')
  }

  function handleCategoryClick(categoryId: string) {
    navigate(`/explorar?categoria=${categoryId}`)
  }

  return (
    <div className="page-container">
      {/* Hero header */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-500 px-5 pt-10 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
            📖
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight">Salinha Bíblica</h1>
            <p className="text-primary-100 text-sm">Dinâmicas para ministério infantil</p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 mt-2">
          <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            📚 {totalActivities} dinâmicas
          </span>
          <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            ✅ {totalCompleted} concluídas
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-5">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por tema, título, versículo..."
        />

        {/* Quick action */}
        <button
          onClick={() => navigate('/planejar')}
          className="flex items-center gap-3 bg-accent-500 text-amber-900 rounded-2xl px-4 py-4
                     font-bold text-sm active:scale-[0.98] transition-transform shadow-card"
        >
          <span className="text-2xl">🗓️</span>
          <div className="text-left">
            <p className="font-extrabold">Montar um encontro</p>
            <p className="text-xs font-medium text-amber-800 mt-0.5">Sugestão automática de roteiro</p>
          </div>
          <svg className="ml-auto text-amber-700" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Categories */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Categorias
          </h2>
          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => {
              const catActivities = activities.filter((a) => a.category === cat.id)
              const catCompleted = catActivities.filter((a) => completed.has(a.id)).length
              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  count={catActivities.length}
                  completed={catCompleted}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
