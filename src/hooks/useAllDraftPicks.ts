import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import type { TradedPick } from './useDraftPicks'

interface PicksByLeague {
  [leagueId: string]: TradedPick[]
}

/**
 * Busca picks de múltiplas ligas em paralelo
 */
async function fetchAllPicks(leagueIds: string[]): Promise<PicksByLeague> {
  const results = await Promise.all(
    leagueIds.map(async (leagueId) => {
      try {
        const res = await fetch(`${API_URL}/league/${leagueId}/traded_picks`)
        if (!res.ok) return { leagueId, picks: [] }
        const picks: TradedPick[] = await res.json()
        return { leagueId, picks }
      } catch {
        return { leagueId, picks: [] }
      }
    })
  )

  const picksByLeague: PicksByLeague = {}
  results.forEach(({ leagueId, picks }) => {
    picksByLeague[leagueId] = picks
  })

  return picksByLeague
}

/**
 * Hook para buscar picks de múltiplas ligas (otimizado)
 */
export function useAllDraftPicks(leagueIds: string[]) {
  return useQuery({
    queryKey: ['allDraftPicks', leagueIds.sort().join(',')],
    queryFn: () => fetchAllPicks(leagueIds),
    enabled: leagueIds.length > 0,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}
