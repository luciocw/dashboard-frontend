/**
 * usePlayerSearch Hook
 * Busca jogadores da Sleeper API com valores anexados
 */

import { useMemo, useState, useCallback } from 'react'
import { usePlayers, type PlayersMap } from '@/hooks/usePlayers'
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
}

// Mapeamento de posições detalhadas para fantasy
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
 * Converte jogadores do Sleeper para formato com valor
 */
function convertPlayers(
  playersMap: PlayersMap | undefined,
  options: UsePlayerSearchOptions
): SleeperPlayerWithValue[] {
  if (!playersMap) return []

  const { position = 'ALL', searchTerm = '', limit = 100, onlyWithValue = false } = options

  const searchLower = searchTerm.toLowerCase().trim()

  const results: SleeperPlayerWithValue[] = []

  for (const [id, player] of Object.entries(playersMap)) {
    // Pula jogadores sem posição ou time
    if (!player.position) continue

    // Mapeia posição para fantasy position
    const fantasyPos = POSITION_MAP[player.position]
    if (!fantasyPos) continue

    // Filtro por posição
    if (position !== 'ALL' && fantasyPos !== position) continue

    // Filtro por termo de busca
    if (searchLower) {
      const fullName = player.full_name || `${player.first_name} ${player.last_name}`
      const nameMatch = fullName.toLowerCase().includes(searchLower)
      const teamMatch = player.team?.toLowerCase().includes(searchLower)
      if (!nameMatch && !teamMatch) continue
    }

    // Obtém valor
    const value = getPlayerValue(id)

    // Filtro onlyWithValue
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

  // Ordena por valor (maior primeiro), depois por nome
  results.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value
    return (a.full_name || '').localeCompare(b.full_name || '')
  })

  return results.slice(0, limit)
}

/**
 * Hook para buscar jogadores com filtros
 */
export function usePlayerSearch(initialOptions?: UsePlayerSearchOptions): UsePlayerSearchResult {
  const { data: playersMap, isLoading, error } = usePlayers()

  const [searchTerm, setSearchTerm] = useState(initialOptions?.searchTerm || '')
  const [position, setPosition] = useState<PlayerPosition | 'ALL'>(initialOptions?.position || 'ALL')

  const players = useMemo(() => {
    return convertPlayers(playersMap, {
      position,
      searchTerm,
      limit: initialOptions?.limit || 100,
      onlyWithValue: initialOptions?.onlyWithValue,
    })
  }, [playersMap, position, searchTerm, initialOptions?.limit, initialOptions?.onlyWithValue])

  const search = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleSetPosition = useCallback((pos: PlayerPosition | 'ALL') => {
    setPosition(pos)
  }, [])

  return {
    players,
    isLoading,
    error: error as Error | null,
    search,
    setPosition: handleSetPosition,
    searchTerm,
    position,
  }
}

/**
 * Hook simplificado para buscar um jogador por ID
 */
export function usePlayerById(playerId: string) {
  const { data: playersMap, isLoading } = usePlayers()

  const player = useMemo(() => {
    if (!playersMap || !playerId) return null
    const p = playersMap[playerId]
    if (!p) return null

    const fantasyPos = POSITION_MAP[p.position] || p.position

    return {
      player_id: playerId,
      first_name: p.first_name,
      last_name: p.last_name,
      full_name: p.full_name || `${p.first_name} ${p.last_name}`,
      position: fantasyPos,
      team: p.team || undefined,
      age: p.age,
      value: getPlayerValue(playerId),
    } as SleeperPlayerWithValue
  }, [playersMap, playerId])

  return { player, isLoading }
}
