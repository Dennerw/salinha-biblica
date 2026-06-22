import { useFiltersStore } from '@/store'
import type { AgeGroup, ActivityType, Environment, EnergyLevel, TheologicalLevel, EditorialRisk } from '@/types'

const ageOptions: { value: AgeGroup; label: string }[] = [
  { value: '3-5', label: '3–5 anos' },
  { value: '6-8', label: '6–8 anos' },
  { value: '9-11', label: '9–11 anos' },
  { value: '12-14', label: '12–14 anos' },
]

const typeOptions: { value: ActivityType; label: string }[] = [
  { value: 'jogo', label: '🎲 Jogo' },
  { value: 'reflexao', label: '💭 Reflexão' },
  { value: 'arte', label: '🎨 Arte' },
  { value: 'teatro', label: '🎭 Teatro' },
  { value: 'musica', label: '🎵 Música' },
  { value: 'oracao', label: '🙏 Oração' },
  { value: 'quebra-gelo', label: '🎯 Quebra-gelo' },
]

const durationOptions: { value: number; label: string }[] = [
  { value: 15, label: 'até 15 min' },
  { value: 20, label: 'até 20 min' },
  { value: 30, label: 'até 30 min' },
  { value: 45, label: 'até 45 min' },
]

const energyOptions: { value: EnergyLevel; label: string }[] = [
  { value: 'calmo', label: '😌 Calmo' },
  { value: 'moderado', label: '😊 Moderado' },
  { value: 'agitado', label: '⚡ Agitado' },
]

const envOptions: { value: Environment; label: string }[] = [
  { value: 'sala', label: '🏠 Sala' },
  { value: 'salao', label: '🏛️ Salão' },
  { value: 'externo', label: '🌳 Externo' },
]

const theologicalOptions: { value: TheologicalLevel; label: string }[] = [
  { value: 'essential', label: '✓ Conteúdo essencial' },
  { value: 'interpretive', label: '↺ Requer adaptação' },
  { value: 'denominational', label: '⚑ Tema denominacional' },
]

const riskOptions: { value: EditorialRisk; label: string }[] = [
  { value: 'low', label: '🟢 Risco baixo' },
  { value: 'medium', label: '🟡 Risco médio' },
  { value: 'high', label: '🔴 Risco alto' },
]

export function FilterBar() {
  const {
    filters,
    toggleAgeGroup,
    toggleType,
    setMaxDuration,
    toggleEnvironment,
    toggleEnergyLevel,
    toggleNoMaterials,
    toggleTheologicalLevel,
    toggleEditorialRisk,
    resetFilters,
    hasActiveFilters,
  } = useFiltersStore()

  const chip = (active: boolean) =>
    `filter-chip ${active ? 'filter-chip-active' : ''}`

  return (
    <div className="flex flex-col gap-3">
      {/* Row: age */}
      <div>
        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Faixa etária</p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {ageOptions.map((o) => (
            <button key={o.value} className={chip(filters.ageGroups.includes(o.value))} onClick={() => toggleAgeGroup(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row: type */}
      <div>
        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Tipo</p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {typeOptions.map((o) => (
            <button key={o.value} className={chip(filters.types.includes(o.value))} onClick={() => toggleType(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row: duration */}
      <div>
        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Duração máxima</p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {durationOptions.map((o) => (
            <button
              key={o.value}
              className={chip(filters.maxDuration === o.value)}
              onClick={() => setMaxDuration(filters.maxDuration === o.value ? null : o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row: energy + env + no-materials */}
      <div className="flex gap-1.5 flex-wrap">
        {energyOptions.map((o) => (
          <button key={o.value} className={chip(filters.energyLevels.includes(o.value))} onClick={() => toggleEnergyLevel(o.value)}>
            {o.label}
          </button>
        ))}
        {envOptions.map((o) => (
          <button key={o.value} className={chip(filters.environments.includes(o.value))} onClick={() => toggleEnvironment(o.value)}>
            {o.label}
          </button>
        ))}
        <button className={chip(filters.noMaterialsOnly)} onClick={toggleNoMaterials}>
          📦 Sem materiais
        </button>
      </div>

      {/* Row: theological level */}
      <div>
        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Classificação teológica</p>
        <div className="flex gap-1.5 flex-wrap">
          {theologicalOptions.map((o) => (
            <button
              key={o.value}
              className={chip(filters.theologicalLevels.includes(o.value))}
              onClick={() => toggleTheologicalLevel(o.value)}
            >
              {o.label}
            </button>
          ))}
          {riskOptions.map((o) => (
            <button
              key={o.value}
              className={chip(filters.editorialRisks.includes(o.value))}
              onClick={() => toggleEditorialRisk(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters() && (
        <button
          onClick={resetFilters}
          className="self-start text-xs font-semibold text-primary-600 underline underline-offset-2"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
