/**
 * IDPTable Component
 * Tabela de jogadores IDP com ordenação e projeção de pontos
 */

import { memo, useState } from 'react'
import { ChevronUp, ChevronDown, Check, Trophy, Star } from 'lucide-react'
import type { IDPPlayer, PlayerTier } from '../types'
import type { SortColumn, SortDirection } from '../utils/filters'
import type { ScoringSettings } from '@/types/sleeper'
import { getPlayerTier, isPotentialMike } from '../utils/filters'
import { calculateIDPProjection, formatPoints } from '../utils/projection'
import { IDP_POSITION_COLORS, IDP_POSITION_BG, TIER_COLORS, IDP_THRESHOLDS } from '../constants'
import { IDPPlayerCard } from './IDPPlayerCard'

interface IDPTableProps {
  players: IDPPlayer[]
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
  isLoading?: boolean
  scoringSettings?: ScoringSettings
}

export const IDPTable = memo(function IDPTable({
  players,
  sortColumn,
  sortDirection,
  onSort,
  isLoading,
  scoringSettings,
}: IDPTableProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<IDPPlayer | null>(null)

  const SortHeader = ({
    column,
    children,
    className = '',
  }: {
    column: SortColumn
    children: React.ReactNode
    className?: string
  }) => {
    const isActive = sortColumn === column
    return (
      <th
        onClick={() => onSort(column)}
        className={`px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 transition-colors ${className}`}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive && (
            sortDirection === 'desc' ? (
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-cyan-400" />
            )
          )}
        </div>
      </th>
    )
  }

  const TierIndicator = ({ tier }: { tier: PlayerTier }) => {
    if (tier === 'elite') {
      return <Trophy className={`w-4 h-4 ${TIER_COLORS.elite}`} />
    }
    if (tier === 'good') {
      return <Star className={`w-4 h-4 ${TIER_COLORS.good}`} />
    }
    return null
  }

  const StatCell = ({
    value,
    position,
    statType,
  }: {
    value: number
    position: string
    statType: 'tackles' | 'sacks' | 'pd'
  }) => {
    const thresholds = IDP_THRESHOLDS[position as keyof typeof IDP_THRESHOLDS]
    if (!thresholds) return <span>{value}</span>

    const goodThresholds = thresholds.good as Record<string, number>
    let threshold = 0
    if (statType === 'tackles') threshold = goodThresholds.tackles || 0
    else if (statType === 'sacks') threshold = goodThresholds.sacks || 0
    else if (statType === 'pd') threshold = goodThresholds.pd || 0

    const isHighlight = value >= threshold

    return (
      <span className={isHighlight ? 'text-cyan-400 font-medium' : ''}>
        {value}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-800" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-slate-800 flex items-center px-4 gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">Nenhum jogador encontrado com os filtros atuais</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <SortHeader column="name" className="w-64">Jogador</SortHeader>
                <SortHeader column="position">Pos</SortHeader>
                <SortHeader column="team">Time</SortHeader>
                <SortHeader column="tackles">TKL</SortHeader>
                <SortHeader column="sacks">SCK</SortHeader>
                <SortHeader column="tfl">TFL</SortHeader>
                <SortHeader column="qbHits">PRES</SortHeader>
                <SortHeader column="pd">PD</SortHeader>
                <SortHeader column="int">INT</SortHeader>
                <SortHeader column="ff">FF</SortHeader>
                <SortHeader column="proj" className="text-right">Proj</SortHeader>
                <th className="px-3 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {players.map((player) => {
                const tier = getPlayerTier(player)
                const isMike = isPotentialMike(player)

                return (
                  <tr
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Jogador */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-slate-400">
                              {player.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Nome e badges */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200 truncate">
                              {player.name}
                            </span>
                            <TierIndicator tier={tier} />
                            {isMike && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
                                Mike
                              </span>
                            )}
                          </div>
                          {player.isInMyRoster && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <Check className="w-3 h-3" />
                              <span>Já tenho</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Posição */}
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${IDP_POSITION_BG[player.fantasyPosition]} ${IDP_POSITION_COLORS[player.fantasyPosition]}`}>
                        {player.fantasyPosition}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {player.teamAbbr || '-'}
                    </td>

                    {/* Stats */}
                    <td className="px-3 py-3 text-sm">
                      <StatCell value={player.stats.tackles} position={player.fantasyPosition} statType="tackles" />
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <StatCell value={player.stats.sacks} position={player.fantasyPosition} statType="sacks" />
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {player.stats.tfl}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {player.stats.qbHits || 0}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <StatCell value={player.stats.passesDefended} position={player.fantasyPosition} statType="pd" />
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {player.stats.interceptions}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {player.stats.forcedFumbles}
                    </td>

                    {/* Projeção de pontos */}
                    <td className="px-3 py-3 text-sm text-right">
                      {(() => {
                        const projection = calculateIDPProjection(player, scoringSettings)
                        return (
                          <span className="font-medium text-cyan-400">
                            {formatPoints(projection.totalPoints)}
                          </span>
                        )
                      })()}
                    </td>

                    {/* Ações */}
                    <td className="px-3 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlayer(player)
                        }}
                        className="px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal do jogador */}
      {selectedPlayer && (
        <IDPPlayerCard
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          scoringSettings={scoringSettings}
        />
      )}
    </>
  )
})
