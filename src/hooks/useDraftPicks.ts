import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import { ApiError } from '@/utils/errors'

/**
 * Representa uma pick de draft negociada
 */
export interface TradedPick {
  season: string
  round: number
  roster_id: number
  previous_owner_id: number
  owner_id: number
}

/**
 * Busca picks negociadas de uma liga
 */
async function fetchTradedPicks(leagueId: string): Promise<TradedPick[]> {
  const endpoint = `${API_URL}/league/${leagueId}/traded_picks`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar picks', res.status, endpoint)
  }
  
  return res.json()
}

/**
 * Hook para buscar picks negociadas da liga
 * @param leagueId - ID da liga
 * @example
 * const { data: picks } = useDraftPicks('123456')
 */
export function useDraftPicks(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['tradedPicks', leagueId],
    queryFn: () => fetchTradedPicks(leagueId!),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}

/**
 * Filtra picks que pertencem a um roster específico
 */
export function getPicksForRoster(
  picks: TradedPick[] | undefined,
  rosterId: number,
  seasons?: string[]
): TradedPick[] {
  if (!picks) return []
  
  return picks
    .filter(pick => pick.owner_id === rosterId)
    .filter(pick => !seasons || seasons.includes(pick.season))
    .sort((a, b) => {
      if (a.season !== b.season) return a.season.localeCompare(b.season)
      return a.round - b.round
    })
}

/**
 * Conta picks perdidas (que o roster original vendeu)
 */
export function getLostPicks(
  picks: TradedPick[] | undefined,
  rosterId: number
): TradedPick[] {
  if (!picks) return []
  
  return picks
    .filter(pick => pick.previous_owner_id === rosterId && pick.owner_id !== rosterId)
    .sort((a, b) => {
      if (a.season !== b.season) return a.season.localeCompare(b.season)
      return a.round - b.round
    })
}
