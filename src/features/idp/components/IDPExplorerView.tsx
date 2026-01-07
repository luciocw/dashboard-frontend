/**
 * IDPExplorerView Component
 * View principal do IDP Explorer - tab dentro de LeagueDetails
 */

import { memo } from 'react'
import { Shield, AlertCircle, Lock, Info } from 'lucide-react'
import { useIDPSearch } from '../hooks/useIDPSearch'
import { IDPFilters } from './IDPFilters'
import { IDPTable } from './IDPTable'
import { useAppStore } from '@/store/useAppStore'
import { hasIDPScoring, getIDPScoringDescription } from '../utils/projection'
import type { ScoringSettings } from '@/types/sleeper'

interface IDPExplorerViewProps {
  myRosterPlayerIds: string[]
  scoringSettings?: ScoringSettings
}

export const IDPExplorerView = memo(function IDPExplorerView({
  myRosterPlayerIds,
  scoringSettings,
}: IDPExplorerViewProps) {
  const isPremiumUser = useAppStore((s) => s.isPremiumUser)
  const hasScoring = hasIDPScoring(scoringSettings)
  const scoringDesc = getIDPScoringDescription(scoringSettings)

  const {
    filteredPlayers,
    isLoading,
    isError,
    error,
    filters,
    updateFilter,
    resetFilters,
    sortColumn,
    sortDirection,
    setSorting,
    totalCount,
    filteredCount,
  } = useIDPSearch({
    myRosterPlayerIds,
    scoringSettings,
  })

  // Gate de premium
  if (!isPremiumUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          Feature Premium
        </h3>
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">
          O IDP Explorer é uma feature exclusiva para usuários premium.
          Com ele você pode buscar e filtrar jogadores defensivos para
          melhorar seu time de fantasy.
        </p>
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all"
          onClick={() => {
            // TODO: Implementar flow de upgrade
            alert('Flow de upgrade será implementado em breve!')
          }}
        >
          Saiba mais sobre Premium
        </button>
      </div>
    )
  }

  // Estado de erro
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-sm text-slate-400 text-center max-w-md mb-4">
          {error?.message || 'Não foi possível carregar os dados da ESPN. Tente novamente.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-200">IDP Explorer</h2>
            <p className="text-sm text-slate-400">
              Encontre os melhores jogadores defensivos para seu time
            </p>
          </div>
        </div>

        {/* Scoring Info */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">
            {hasScoring ? scoringDesc : 'Sem scoring IDP configurado'}
          </span>
        </div>
      </div>

      {/* Layout: Filtros + Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filtros (sidebar em desktop) */}
        <div className="lg:col-span-1">
          <IDPFilters
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        </div>

        {/* Tabela */}
        <div className="lg:col-span-3">
          <IDPTable
            players={filteredPlayers}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={setSorting}
            isLoading={isLoading}
            scoringSettings={scoringSettings}
          />
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500/20" />
          <span>Mike LB: LB com 110+ tackles</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-cyan-400">Destacado:</span>
          <span>Acima do threshold de "bom" para a posição</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-400">Já tenho:</span>
          <span>Jogador no seu roster desta liga</span>
        </div>
      </div>
    </div>
  )
})
