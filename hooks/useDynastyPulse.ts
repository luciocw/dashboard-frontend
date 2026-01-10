/**
 * useDynastyPulse Hook
 * Fetches player values from Dynasty Pulse API
 * Supports both standard values and league-adjusted premium values
 */

import { useQuery } from '@tanstack/react-query'
import { DYNASTY_PULSE_API_URL, CACHE_TIMES } from '@/constants'
import { logger } from '@/lib/logger'

/**
 * Dynasty window info for a player
 */
export interface DynastyWindow {
  current_factor: number
  peak_years_left: number
  projected_3yr: number
  tier: 'rising' | 'prime' | 'declining' | 'veteran' | 'unknown'
  recommendation: 'buy' | 'hold' | 'sell'
}

/**
 * Player value breakdown from Dynasty Pulse
 */
export interface PlayerValueBreakdown {
  player_id: string
  name: string
  position: string
  team: string | null
  age: number | null
  ppg: number
  vorp: number
  vorp_tier: 'elite' | 'star' | 'starter' | 'depth' | 'replacement' | 'unknown'
  age_factor: number
  age_tier: string
  raw_value: number
  final_value: number      // 0-10000
  display_value: number    // 0-100
  dynasty_window: DynastyWindow
}

/**
 * Dynasty Pulse API response
 */
export interface DynastyPulseResponse {
  season: number
  superflex: boolean
  tep: boolean
  count: number
  players: PlayerValueBreakdown[]
}

/**
 * Map of player_id to value breakdown
 */
export type DynastyPulseValuesMap = Record<string, PlayerValueBreakdown>

/**
 * Fetch options for Dynasty Pulse
 */
export interface DynastyPulseOptions {
  season?: number
  position?: string
  superflex?: boolean
  tep?: boolean
}

/**
 * Fetches all player values from Dynasty Pulse API
 */
async function fetchDynastyPulseValues(options: DynastyPulseOptions = {}): Promise<DynastyPulseValuesMap> {
  const { season = 2024, position, superflex = false, tep = false } = options

  const params = new URLSearchParams({
    season: season.toString(),
    superflex: superflex.toString(),
    tep: tep.toString(),
  })

  if (position) {
    params.set('position', position)
  }

  const endpoint = `${DYNASTY_PULSE_API_URL}/api/dynasty-pulse/values?${params}`

  try {
    const res = await fetch(endpoint)

    if (!res.ok) {
      logger.warn(`Dynasty Pulse API error: ${res.status}`)
      return {}
    }

    const data: DynastyPulseResponse = await res.json()

    // Convert array to map keyed by player_id
    const valuesMap: DynastyPulseValuesMap = {}
    for (const player of data.players) {
      valuesMap[player.player_id] = player
    }

    return valuesMap
  } catch {
    logger.warn('Dynasty Pulse API unavailable, using fallback values')
    return {}
  }
}

/**
 * Hook to fetch Dynasty Pulse values
 * Returns a map of player_id to value breakdown
 *
 * @example
 * const { data: values, isLoading } = useDynastyPulse()
 * const playerValue = values?.['9509'] // Ja'Marr Chase
 * console.log(playerValue?.display_value) // 99.2
 */
export function useDynastyPulse(options: DynastyPulseOptions = {}) {
  const { season = 2024, superflex = false, tep = false } = options

  return useQuery({
    queryKey: ['dynasty-pulse', season, superflex, tep],
    queryFn: () => fetchDynastyPulseValues(options),
    staleTime: CACHE_TIMES.DYNASTY_PULSE,
    gcTime: CACHE_TIMES.DYNASTY_PULSE_GC,
    // Don't fail the whole app if Dynasty Pulse is down
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Get player value from Dynasty Pulse map
 * Returns display_value (0-100) or 0 if not found
 */
export function getDynastyPulseValue(
  valuesMap: DynastyPulseValuesMap | undefined,
  playerId: string
): number {
  if (!valuesMap || !playerId) return 0
  return valuesMap[playerId]?.display_value ?? 0
}

/**
 * Get full player breakdown from Dynasty Pulse map
 */
export function getDynastyPulseBreakdown(
  valuesMap: DynastyPulseValuesMap | undefined,
  playerId: string
): PlayerValueBreakdown | null {
  if (!valuesMap || !playerId) return null
  return valuesMap[playerId] ?? null
}

// ============================================
// League-Adjusted Values (Premium Feature)
// ============================================

/**
 * Extended breakdown with scoring adjustments
 */
export interface LeagueAdjustedBreakdown extends PlayerValueBreakdown {
  base_value: number
  scoring_multiplier: number
  scoring_adjustments: Record<string, number>
}

/**
 * League info response
 */
export interface LeagueInfo {
  league_id: string
  name: string
  league_type: string
  is_superflex: boolean
  is_tep: boolean
  roster_positions: string[]
  key_scoring_settings: {
    rec: number
    bonus_rec_te: number
    pass_td: number
    idp_tkl_solo: number
    idp_sack: number
    idp_int: number
  }
  total_rosters: number
  status: string
}

/**
 * League-adjusted values response
 */
export interface LeagueAdjustedResponse {
  league_id: string
  league_name: string
  league_type: string
  is_superflex: boolean
  is_tep: boolean
  season: number
  count: number
  players: LeagueAdjustedBreakdown[]
}

export type LeagueAdjustedValuesMap = Record<string, LeagueAdjustedBreakdown>

/**
 * Fetches league info from Dynasty Pulse API
 */
async function fetchLeagueInfo(leagueId: string): Promise<LeagueInfo | null> {
  const endpoint = `${DYNASTY_PULSE_API_URL}/api/dynasty-pulse/league/${leagueId}/info`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) {
      logger.warn(`Failed to fetch league info: ${res.status}`)
      return null
    }
    return res.json()
  } catch (error) {
    logger.warn('Failed to fetch league info:', error)
    return null
  }
}

/**
 * Fetches league-adjusted values from Dynasty Pulse API
 */
async function fetchLeagueAdjustedValues(
  leagueId: string,
  season: number = 2024
): Promise<LeagueAdjustedValuesMap> {
  const endpoint = `${DYNASTY_PULSE_API_URL}/api/dynasty-pulse/league/${leagueId}/values?season=${season}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) {
      logger.warn(`Failed to fetch league-adjusted values: ${res.status}`)
      return {}
    }

    const data: LeagueAdjustedResponse = await res.json()

    // Convert array to map
    const valuesMap: LeagueAdjustedValuesMap = {}
    for (const player of data.players) {
      valuesMap[player.player_id] = player
    }

    return valuesMap
  } catch (error) {
    logger.warn('Failed to fetch league-adjusted values:', error)
    return {}
  }
}

/**
 * Hook to fetch league info
 */
export function useLeagueInfo(leagueId: string | null) {
  return useQuery({
    queryKey: ['league-info', leagueId],
    queryFn: () => (leagueId ? fetchLeagueInfo(leagueId) : null),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.DYNASTY_PULSE,
    gcTime: CACHE_TIMES.DYNASTY_PULSE_GC,
  })
}

/**
 * Hook to fetch league-adjusted Dynasty Pulse values (Premium)
 *
 * @example
 * const { data: values, leagueInfo } = useLeagueAdjustedValues('123456789')
 * const playerValue = values?.['9509']
 * console.log(playerValue?.display_value) // League-adjusted value
 * console.log(playerValue?.scoring_adjustments) // { tep: 15, tackles: 10 }
 */
export function useLeagueAdjustedValues(leagueId: string | null, season: number = 2024) {
  const valuesQuery = useQuery({
    queryKey: ['dynasty-pulse-league', leagueId, season],
    queryFn: () => (leagueId ? fetchLeagueAdjustedValues(leagueId, season) : {}),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.DYNASTY_PULSE,
    gcTime: CACHE_TIMES.DYNASTY_PULSE_GC,
    retry: 1,
  })

  const infoQuery = useLeagueInfo(leagueId)

  return {
    data: valuesQuery.data,
    leagueInfo: infoQuery.data,
    isLoading: valuesQuery.isLoading || infoQuery.isLoading,
    error: valuesQuery.error || infoQuery.error,
    isLeagueAdjusted: !!leagueId && !!valuesQuery.data && Object.keys(valuesQuery.data).length > 0,
  }
}

/**
 * Get league-adjusted value with scoring adjustment info
 */
export function getLeagueAdjustedValue(
  valuesMap: LeagueAdjustedValuesMap | undefined,
  playerId: string
): { value: number; multiplier: number; adjustments: Record<string, number> } | null {
  if (!valuesMap || !playerId) return null
  const player = valuesMap[playerId]
  if (!player) return null

  return {
    value: player.display_value,
    multiplier: player.scoring_multiplier,
    adjustments: player.scoring_adjustments,
  }
}

/**
 * Format scoring adjustments for display
 * @returns String like "+15% TEP, +10% Tackles"
 */
export function formatScoringAdjustments(adjustments: Record<string, number>): string {
  if (!adjustments || Object.keys(adjustments).length === 0) {
    return ''
  }

  const parts = Object.entries(adjustments)
    .filter(([_, value]) => value !== 0)
    .map(([key, value]) => {
      const sign = value > 0 ? '+' : ''
      const label = key.toUpperCase()
      return `${sign}${value}% ${label}`
    })

  return parts.join(', ')
}

// ============================================
// Multi-Season Values (Enhanced)
// ============================================

/**
 * Player trend data
 */
export interface PlayerTrend {
  direction: 'up' | 'down' | 'stable'
  magnitude: number
  consistency: number
}

/**
 * Enhanced dynasty window with trends
 */
export interface EnhancedDynastyWindow extends DynastyWindow {
  trend_factor: number
  trend_notes: string[]
  seasons_analyzed: number
}

/**
 * Multi-season player breakdown
 */
export interface MultiSeasonBreakdown extends PlayerValueBreakdown {
  trends: Record<string, PlayerTrend>
  dynasty_window: EnhancedDynastyWindow
  seasons_aggregated: number[]
  aggregation_weights: Record<number, number>
}

/**
 * Multi-season API response
 */
export interface MultiSeasonResponse {
  seasons: number[]
  current_season: number
  num_seasons: number
  superflex: boolean
  tep: boolean
  weights: Record<number, number>
  count: number
  players: MultiSeasonBreakdown[]
}

export type MultiSeasonValuesMap = Record<string, MultiSeasonBreakdown>

/**
 * Fetch options for multi-season
 */
export interface MultiSeasonOptions {
  numSeasons?: number
  position?: string
  superflex?: boolean
  tep?: boolean
}

/**
 * Fetches multi-season aggregated values from Dynasty Pulse API
 */
async function fetchMultiSeasonValues(options: MultiSeasonOptions = {}): Promise<MultiSeasonValuesMap> {
  const { numSeasons = 3, position, superflex = false, tep = false } = options

  const params = new URLSearchParams({
    num_seasons: numSeasons.toString(),
    superflex: superflex.toString(),
    tep: tep.toString(),
  })

  if (position) {
    params.set('position', position)
  }

  const endpoint = `${DYNASTY_PULSE_API_URL}/api/dynasty-pulse/values/multi-season?${params}`

  try {
    const res = await fetch(endpoint)

    if (!res.ok) {
      logger.warn(`Dynasty Pulse multi-season API error: ${res.status}`)
      return {}
    }

    const data: MultiSeasonResponse = await res.json()

    // Convert array to map keyed by player_id
    const valuesMap: MultiSeasonValuesMap = {}
    for (const player of data.players) {
      valuesMap[player.player_id] = player
    }

    return valuesMap
  } catch {
    logger.warn('Dynasty Pulse multi-season API unavailable')
    return {}
  }
}

/**
 * Hook to fetch multi-season Dynasty Pulse values
 *
 * @example
 * const { data: values, isLoading } = useMultiSeasonValues({ numSeasons: 3 })
 * const player = values?.['9509'] // Ja'Marr Chase
 * console.log(player?.trends) // { receivingYards: { direction: 'up', magnitude: 15.2 } }
 * console.log(player?.dynasty_window.trend_notes) // ['+15% receivingYards/yr']
 */
export function useMultiSeasonValues(options: MultiSeasonOptions = {}) {
  const { numSeasons = 3, superflex = false, tep = false } = options

  return useQuery({
    queryKey: ['dynasty-pulse-multi', numSeasons, superflex, tep],
    queryFn: () => fetchMultiSeasonValues(options),
    staleTime: CACHE_TIMES.DYNASTY_PULSE,
    gcTime: CACHE_TIMES.DYNASTY_PULSE_GC,
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Get multi-season breakdown for a player
 */
export function getMultiSeasonBreakdown(
  valuesMap: MultiSeasonValuesMap | undefined,
  playerId: string
): MultiSeasonBreakdown | null {
  if (!valuesMap || !playerId) return null
  return valuesMap[playerId] ?? null
}

/**
 * Format trend for display
 * @returns String like "↑ 15.2% (consistent)" or "↓ 8.5% (volatile)"
 */
export function formatTrend(trend: PlayerTrend): string {
  const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'
  const stability = trend.consistency >= 0.7 ? 'consistent' : 'volatile'
  return `${arrow} ${Math.abs(trend.magnitude).toFixed(1)}% (${stability})`
}
