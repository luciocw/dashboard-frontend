/**
 * IDPFilters Component
 * Painel de filtros para busca de IDPs
 */

import { memo } from 'react'
import { RotateCcw } from 'lucide-react'
import type { IDPFilters as IDPFiltersType, FantasyPosition } from '../types'
import { FILTER_SUGGESTIONS, IDP_POSITION_BG } from '../constants'

interface IDPFiltersProps {
  filters: IDPFiltersType
  onFilterChange: <K extends keyof IDPFiltersType>(key: K, value: IDPFiltersType[K]) => void
  onReset: () => void
  totalCount: number
  filteredCount: number
  availableSeasons?: number[]
}

const DEFAULT_SEASONS = [2024, 2023, 2022, 2021, 2020]

export const IDPFilters = memo(function IDPFilters({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
  availableSeasons = DEFAULT_SEASONS,
}: IDPFiltersProps) {
  const positions: FantasyPosition[] = ['DL', 'LB', 'DB']
  const seasons = availableSeasons.length > 0 ? availableSeasons : DEFAULT_SEASONS

  const togglePosition = (pos: FantasyPosition) => {
    const current = filters.positions
    if (current.includes(pos)) {
      // Remove se já está selecionado (mas mantém pelo menos 1)
      if (current.length > 1) {
        onFilterChange('positions', current.filter((p) => p !== pos))
      }
    } else {
      // Adiciona
      onFilterChange('positions', [...current, pos])
    }
  }

  const selectAllPositions = () => {
    onFilterChange('positions', positions)
  }

  const applySuggestion = (pos: FantasyPosition) => {
    const suggestion = FILTER_SUGGESTIONS[pos]
    if (suggestion) {
      // Reseta todos os filtros numéricos primeiro
      onFilterChange('minTackles', 0)
      onFilterChange('minSacks', 0)
      onFilterChange('minTFL', 0)
      onFilterChange('minFF', 0)
      onFilterChange('minPD', 0)

      // Aplica posição
      onFilterChange('positions', [pos])

      // Aplica filtros específicos da sugestão
      const suggestionFilters = suggestion.filters as { minTackles?: number; minSacks?: number }
      if (suggestionFilters.minTackles) {
        onFilterChange('minTackles', suggestionFilters.minTackles)
      }
      if (suggestionFilters.minSacks) {
        onFilterChange('minSacks', suggestionFilters.minSacks)
      }
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Filtros</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {filteredCount} de {totalCount} jogadores
          </span>
          <button
            onClick={onReset}
            aria-label="Resetar filtros"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Resetar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Posições */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-500 uppercase tracking-wider">Posição</label>
          <button
            onClick={selectAllPositions}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Todas
          </button>
        </div>
        <div className="flex gap-2" role="group" aria-label="Filtros de posição IDP">
          {positions.map((pos) => {
            const isSelected = filters.positions.includes(pos)
            return (
              <button
                key={pos}
                onClick={() => togglePosition(pos)}
                aria-label={`Filtrar por ${pos}`}
                aria-pressed={isSelected}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isSelected
                    ? `${IDP_POSITION_BG[pos]} text-white border border-slate-600`
                    : 'bg-slate-800 text-slate-400 border border-transparent hover:border-slate-700'
                  }
                `}
              >
                {pos}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sugestões rápidas */}
      <div className="space-y-2">
        <label className="text-xs text-slate-500 uppercase tracking-wider">Filtros rápidos</label>
        <div className="flex flex-wrap gap-2">
          {positions.map((pos) => {
            const suggestion = FILTER_SUGGESTIONS[pos]
            return (
              <button
                key={pos}
                onClick={() => applySuggestion(pos)}
                className="px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={suggestion.description}
              >
                {suggestion.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats mínimas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Min Tackles</label>
          <input
            type="number"
            value={filters.minTackles || ''}
            onChange={(e) => onFilterChange('minTackles', Number(e.target.value) || 0)}
            placeholder="0"
            min={0}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Min Sacks</label>
          <input
            type="number"
            value={filters.minSacks || ''}
            onChange={(e) => onFilterChange('minSacks', Number(e.target.value) || 0)}
            placeholder="0"
            min={0}
            step={0.5}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Min PD</label>
          <input
            type="number"
            value={filters.minPD || ''}
            onChange={(e) => onFilterChange('minPD', Number(e.target.value) || 0)}
            placeholder="0"
            min={0}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Temporada</label>
          <select
            value={filters.season}
            onChange={(e) => onFilterChange('season', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle "mostrar apenas disponíveis" */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showOnlyAvailable}
          onChange={(e) => onFilterChange('showOnlyAvailable', e.target.checked)}
          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
        />
        <span className="text-sm text-slate-300">Esconder jogadores que já tenho</span>
      </label>
    </div>
  )
})
