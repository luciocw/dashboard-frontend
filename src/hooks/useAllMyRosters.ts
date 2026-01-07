import { useQuery } from '@tanstack/react-query'
import type { SleeperRoster } from '@/types/sleeper'

const API = 'https://api.sleeper.app/v1'

interface RostersByLeague {
  [leagueId: string]: SleeperRoster | null
}

async function fetchAllRosters(
  leagueIds: string[],
  userId: string
): Promise<RostersByLeague> {
  // Buscar todos os rosters em paralelo
  const results = await Promise.all(
    leagueIds.map(async (leagueId) => {
      try {
        const res = await fetch(`${API}/league/${leagueId}/rosters`)
        if (!res.ok) return { leagueId, roster: null }
        
        const rosters: SleeperRoster[] = await res.json()
        const myRoster = rosters.find(r => r.owner_id === userId) || null
        
        return { leagueId, roster: myRoster }
      } catch {
        return { leagueId, roster: null }
      }
    })
  )

  // Converter array para objeto
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
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
  })
}
