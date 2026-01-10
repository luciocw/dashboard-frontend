/**
 * usePlayerSearch Hook
 * Fetches players from Sleeper API with Dynasty Pulse values
 */

import { useMemo, useState, useCallback } from 'react'
import { usePlayers, type PlayersMap } from '@/hooks/usePlayers'
import { useDynastyPulse, getDynastyPulseValue, type DynastyPulseValuesMap } from '@/hooks/useDynastyPulse'
import { getPlayerValue } from '../constants'
import type { PlayerPosition, SleeperPlayerWithValue } from '../types'

interface UsePlayerSearchOptions {
  position?: PlayerPosition | 'ALL'
  searchTerm?: string
  limit?: number
  onlyWithValue?: boolean
}

interface UsePlayerSearchResult {
  players: SleeperPlayerWithValue[]
  isLoading: boolean
  error: Error | null
  search: (term: string) => void
  setPosition: (pos: PlayerPosition | 'ALL') => void
  searchTerm: string
  position: PlayerPosition | 'ALL'
  // Dynasty Pulse info
  isDynastyPulseActive: boolean
}

// Position mapping from detailed to fantasy positions
const POSITION_MAP: Record<string, PlayerPosition> = {
  QB: 'QB',
  RB: 'RB',
  WR: 'WR',
  TE: 'TE',
  K: 'K',
  // Defensive Line
  DE: 'DL',
  DT: 'DL',
  NT: 'DL',
  DL: 'DL',
  // Linebackers
  LB: 'LB',
  ILB: 'LB',
  OLB: 'LB',
  MLB: 'LB',
  // Defensive Backs
  CB: 'DB',
  S: 'DB',
  FS: 'DB',
  SS: 'DB',
  DB: 'DB',
}

/**
 * Converts Sleeper players to format with value
 * Uses Dynasty Pulse values if available, falls back to hardcoded values
 */
function convertPlayers(
  playersMap: PlayersMap | undefined,
  dynastyPulseValues: DynastyPulseValuesMap | undefined,
  options: UsePlayerSearchOptions
): SleeperPlayerWithValue[] {
  if (!playersMap) return []

  const { position = 'ALL', searchTerm = '', limit = 100, onlyWithValue = false } = options
  const searchLower = searchTerm.toLowerCase().trim()
  const results: SleeperPlayerWithValue[] = []

  for (const [id, player] of Object.entries(playersMap)) {
    // Skip players without position
    if (!player.position) continue

    // Map to fantasy position
    const fantasyPos = POSITION_MAP[player.position]
    if (!fantasyPos) continue

    // Position filter
    if (position !== 'ALL' && fantasyPos !== position) continue

    // Search filter
    if (searchLower) {
      const fullName = player.full_name || `${player.first_name} ${player.last_name}`
      const nameMatch = fullName.toLowerCase().includes(searchLower)
      const teamMatch = player.team?.toLowerCase().includes(searchLower)
      if (!nameMatch && !teamMatch) continue
    }

    // Get value - Dynasty Pulse first, fallback to hardcoded
    let value = getDynastyPulseValue(dynastyPulseValues, id)
    if (value === 0) {
      // Fallback to hardcoded values if Dynasty Pulse doesn't have this player
      value = getPlayerValue(id)
    }

    // onlyWithValue filter
    if (onlyWithValue && value === 0) continue

    results.push({
      player_id: id,
      first_name: player.first_name,
      last_name: player.last_name,
      full_name: player.full_name || `${player.first_name} ${player.last_name}`,
      position: fantasyPos,
      team: player.team || undefined,
      age: player.age,
      value,
    })
  }

  // Sort by value (highest first), then by name
  results.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value
    return (a.full_name || '').localeCompare(b.full_name || '')
  })

  return results.slice(0, limit)
}

/**
 * Hook for searching players with filters
 * Uses Dynasty Pulse API for dynamic values
 */
export function usePlayerSearch(initialOptions?: UsePlayerSearchOptions): UsePlayerSearchResult {
  const { data: playersMap, isLoading: playersLoading, error: playersError } = usePlayers()
  const { data: dynastyPulseValues, isLoading: dpLoading } = useDynastyPulse()

  const [searchTerm, setSearchTerm] = useState(initialOptions?.searchTerm || '')
  const [position, setPosition] = useState<PlayerPosition | 'ALL'>(initialOptions?.position || 'ALL')

  const players = useMemo(() => {
    return convertPlayers(playersMap, dynastyPulseValues, {
      position,
      searchTerm,
      limit: initialOptions?.limit || 100,
      onlyWithValue: initialOptions?.onlyWithValue,
    })
  }, [playersMap, dynastyPulseValues, position, searchTerm, initialOptions?.limit, initialOptions?.onlyWithValue])

  const search = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleSetPosition = useCallback((pos: PlayerPosition | 'ALL') => {
    setPosition(pos)
  }, [])

  // Dynasty Pulse is active if we have data from it
  const isDynastyPulseActive = !!dynastyPulseValues && Object.keys(dynastyPulseValues).length > 0

  return {
    players,
    isLoading: playersLoading || dpLoading,
    error: playersError as Error | null,
    search,
    setPosition: handleSetPosition,
    searchTerm,
    position,
    isDynastyPulseActive,
  }
}

/**
 * Simplified hook to fetch a single player by ID
 */
export function usePlayerById(playerId: string) {
  const { data: playersMap, isLoading: playersLoading } = usePlayers()
  const { data: dynastyPulseValues } = useDynastyPulse()

  const player = useMemo(() => {
    if (!playersMap || !playerId) return null
    const p = playersMap[playerId]
    if (!p) return null

    const fantasyPos = POSITION_MAP[p.position] || p.position

    // Get value - Dynasty Pulse first, fallback to hardcoded
    let value = getDynastyPulseValue(dynastyPulseValues, playerId)
    if (value === 0) {
      value = getPlayerValue(playerId)
    }

    return {
      player_id: playerId,
      first_name: p.first_name,
      last_name: p.last_name,
      full_name: p.full_name || `${p.first_name} ${p.last_name}`,
      position: fantasyPos,
      team: p.team || undefined,
      age: p.age,
      value,
    } as SleeperPlayerWithValue
  }, [playersMap, dynastyPulseValues, playerId])

  return { player, isLoading: playersLoading }
}
