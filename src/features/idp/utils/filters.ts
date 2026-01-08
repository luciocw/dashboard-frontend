/**
 * Filter Utils
 * Funções para filtrar jogadores IDP
 */

import type { IDPPlayer, IDPFilters, FantasyPosition, PlayerTier } from '../types'
import type { ScoringSettings } from '@/types/sleeper'
import { IDP_THRESHOLDS } from '../constants'
import { calculateIDPProjection } from './projection'

/**
 * Aplica todos os filtros em uma lista de jogadores
 */
export function applyFilters(
  players: IDPPlayer[],
  filters: IDPFilters
): IDPPlayer[] {
  return players.filter((player) => {
    // Filtro por posição
    if (filters.positions.length > 0 && !filters.positions.includes(player.fantasyPosition)) {
      return false
    }

    // Filtro por tackles mínimos
    if (filters.minTackles > 0 && player.stats.tackles < filters.minTackles) {
      return false
    }

    // Filtro por sacks mínimos
    if (filters.minSacks > 0 && player.stats.sacks < filters.minSacks) {
      return false
    }

    // Filtro por TFL mínimos
    if (filters.minTFL > 0 && player.stats.tfl < filters.minTFL) {
      return false
    }

    // Filtro por FF mínimos
    if (filters.minFF > 0 && player.stats.forcedFumbles < filters.minFF) {
      return false
    }

    // Filtro por PD mínimos
    if (filters.minPD > 0 && player.stats.passesDefended < filters.minPD) {
      return false
    }

    // Filtro "mostrar apenas disponíveis" (não tenho no roster)
    if (filters.showOnlyAvailable && player.isInMyRoster) {
      return false
    }

    return true
  })
}

/**
 * Ordena jogadores por uma coluna específica
 */
export type SortColumn =
  | 'name'
  | 'position'
  | 'team'
  | 'tackles'
  | 'sacks'
  | 'tfl'
  | 'qbHits'
  | 'ff'
  | 'pd'
  | 'int'
  | 'proj'

export type SortDirection = 'asc' | 'desc'

export function sortPlayers(
  players: IDPPlayer[],
  column: SortColumn,
  direction: SortDirection,
  scoringSettings?: ScoringSettings
): IDPPlayer[] {
  const sorted = [...players].sort((a, b) => {
    let valueA: string | number = ''
    let valueB: string | number = ''

    switch (column) {
      case 'name':
        valueA = a.name.toLowerCase()
        valueB = b.name.toLowerCase()
        break
      case 'position':
        valueA = a.fantasyPosition
        valueB = b.fantasyPosition
        break
      case 'team':
        valueA = a.teamAbbr.toLowerCase()
        valueB = b.teamAbbr.toLowerCase()
        break
      case 'tackles':
        valueA = a.stats.tackles
        valueB = b.stats.tackles
        break
      case 'sacks':
        valueA = a.stats.sacks
        valueB = b.stats.sacks
        break
      case 'tfl':
        valueA = a.stats.tfl
        valueB = b.stats.tfl
        break
      case 'qbHits':
        valueA = a.stats.qbHits || 0
        valueB = b.stats.qbHits || 0
        break
      case 'ff':
        valueA = a.stats.forcedFumbles
        valueB = b.stats.forcedFumbles
        break
      case 'pd':
        valueA = a.stats.passesDefended
        valueB = b.stats.passesDefended
        break
      case 'int':
        valueA = a.stats.interceptions
        valueB = b.stats.interceptions
        break
      case 'proj':
        valueA = calculateIDPProjection(a, scoringSettings).totalPoints
        valueB = calculateIDPProjection(b, scoringSettings).totalPoints
        break
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    }

    return direction === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number)
  })

  return sorted
}

/**
 * Determina o tier de um jogador baseado nos thresholds
 */
export function getPlayerTier(player: IDPPlayer): PlayerTier {
  const { fantasyPosition, stats } = player
  const thresholds = IDP_THRESHOLDS[fantasyPosition]

  if (!thresholds) return 'average'

  const eliteThresholds = thresholds.elite as Record<string, number>
  const goodThresholds = thresholds.good as Record<string, number>

  // Verifica se é elite
  if (fantasyPosition === 'LB') {
    if (stats.tackles >= (eliteThresholds.tackles || 0)) return 'elite'
    if (stats.tackles >= (goodThresholds.tackles || 0)) return 'good'
  } else if (fantasyPosition === 'DL') {
    if (stats.sacks >= (eliteThresholds.sacks || 0)) return 'elite'
    if (stats.sacks >= (goodThresholds.sacks || 0)) return 'good'
  } else if (fantasyPosition === 'DB') {
    if (stats.tackles >= (eliteThresholds.tackles || 0) || stats.passesDefended >= (eliteThresholds.pd || 0)) return 'elite'
    if (stats.tackles >= (goodThresholds.tackles || 0) || stats.passesDefended >= (goodThresholds.pd || 0)) return 'good'
  }

  return 'average'
}

/**
 * Verifica se um LB é potencialmente um "Mike" (middle linebacker)
 * Baseado no documento: LBs com 110+ tackles são normalmente Mikes
 */
export function isPotentialMike(player: IDPPlayer): boolean {
  if (player.fantasyPosition !== 'LB') return false
  return player.stats.tackles >= 110
}

/**
 * Filtra apenas jogadores de posições defensivas
 */
export function filterDefensivePlayers(players: IDPPlayer[]): IDPPlayer[] {
  const defensivePositions: FantasyPosition[] = ['DL', 'LB', 'DB']
  return players.filter((p) => defensivePositions.includes(p.fantasyPosition))
}

/**
 * Agrupa jogadores por posição
 */
export function groupByPosition(
  players: IDPPlayer[]
): Record<FantasyPosition, IDPPlayer[]> {
  return {
    DL: players.filter((p) => p.fantasyPosition === 'DL'),
    LB: players.filter((p) => p.fantasyPosition === 'LB'),
    DB: players.filter((p) => p.fantasyPosition === 'DB'),
  }
}

/**
 * Calcula estatísticas resumidas de uma lista de jogadores
 */
export function calculateSummaryStats(players: IDPPlayer[]) {
  if (players.length === 0) {
    return {
      total: 0,
      byPosition: { DL: 0, LB: 0, DB: 0 },
      avgTackles: 0,
      avgSacks: 0,
      eliteCount: 0,
    }
  }

  const byPosition = {
    DL: players.filter((p) => p.fantasyPosition === 'DL').length,
    LB: players.filter((p) => p.fantasyPosition === 'LB').length,
    DB: players.filter((p) => p.fantasyPosition === 'DB').length,
  }

  const totalTackles = players.reduce((sum, p) => sum + p.stats.tackles, 0)
  const totalSacks = players.reduce((sum, p) => sum + p.stats.sacks, 0)
  const eliteCount = players.filter((p) => getPlayerTier(p) === 'elite').length

  return {
    total: players.length,
    byPosition,
    avgTackles: Math.round(totalTackles / players.length),
    avgSacks: Math.round((totalSacks / players.length) * 10) / 10,
    eliteCount,
  }
}
