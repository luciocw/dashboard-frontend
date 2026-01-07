import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import { ApiError } from '@/utils/errors'
import type { SleeperRoster } from '@/types/sleeper'

interface RostersByLeague {
  [leagueId: string]: SleeperRoster | null
}

async function fetchAllRosters(
  leagueIds: string[],
  userId: string
): Promise<RostersByLeague> {
  const results = await Promise.all(
    leagueIds.map(async (leagueId) => {
      try {
        const endpoint = `${API_URL}/league/${leagueId}/rosters`
        const res = await fetch(endpoint)
        
        if (!res.ok) {
          throw new ApiError('Erro ao buscar roster', res.status, endpoint)
        }
        
        const rosters: SleeperRoster[] = await res.json()
        const myRoster = rosters.find(r => r.owner_id === userId) || null
        
        return { leagueId, roster: myRoster }
      } catch {
        return { leagueId, roster: null }
      }
    })
  )

  const rostersByLeague: RostersByLeague = {}
  results.forEach(({ leagueId, roster }) => {
    rostersByLeague[leagueId] = roster
  })

  return rostersByLeague
}

export function useAllMyRosters(leagueIds: string[], userId: string | undefined) {
  return useQuery({
    queryKey: ['allMyRosters', leagueIds.sort().join(','), userId],
    queryFn: () => fetchAllRosters(leagueIds, userId!),
    enabled: leagueIds.length > 0 && !!userId,
    staleTime: CACHE_TIMES.ROSTERS,
  })
}
