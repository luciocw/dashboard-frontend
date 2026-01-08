/**
 * useIDPLeaders Hook
 * Busca stats defensivas do backend Python (nflverse data)
 */

import { useQuery } from '@tanstack/react-query'
import { STATS_API, IDP_CACHE_TIMES } from '../constants'
import type { IDPPlayer } from '../types'

interface DefenseStatsResponse {
  season: number
  count: number
  players: IDPPlayer[]
  attribution: string
}

async function fetchDefenseStats(season: string): Promise<IDPPlayer[]> {
  const url = `${STATS_API.BASE_URL}${STATS_API.DEFENSE}?season=${season}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar stats defensivas: ${response.status}`)
  }

  const data: DefenseStatsResponse = await response.json()

  return data.players
}

/**
 * Hook para buscar jogadores defensivos do backend
 * @param season - Temporada (ex: '2024')
 * @returns Query result com dados dos jogadores IDP
 */
export function useIDPLeaders(season: string) {
  return useQuery({
    queryKey: ['idp-players', season],
    queryFn: () => fetchDefenseStats(season),
    staleTime: IDP_CACHE_TIMES.PLAYERS,
    enabled: !!season,
  })
}
