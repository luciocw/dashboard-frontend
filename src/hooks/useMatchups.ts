import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { ApiError } from '@/utils/errors'
import type { SleeperUser, SleeperRoster } from '@/types/sleeper'

/**
 * Matchup individual de um time
 */
export interface MatchupTeam {
  roster_id: number
  points: number
  matchup_id: number
}

/**
 * Matchup completo com os dois times
 */
export interface Matchup {
  matchup_id: number
  team1: {
    roster_id: number
    points: number
    owner?: SleeperUser
    roster?: SleeperRoster
  }
  team2: {
    roster_id: number
    points: number
    owner?: SleeperUser
    roster?: SleeperRoster
  }
}

/**
 * Busca matchups de uma semana
 */
async function fetchMatchups(leagueId: string, week: number): Promise<MatchupTeam[]> {
  const endpoint = `${API_URL}/league/${leagueId}/matchups/${week}`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar matchups', res.status, endpoint)
  }
  
  return res.json()
}

/**
 * Hook para buscar matchups de uma semana
 */
export function useMatchups(leagueId: string | undefined, week: number) {
  return useQuery({
    queryKey: ['matchups', leagueId, week],
    queryFn: () => fetchMatchups(leagueId!, week),
    enabled: !!leagueId && week > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos (matchups mudam durante jogos)
  })
}

/**
 * Agrupa matchups por matchup_id para formar os confrontos
 */
export function groupMatchups(
  matchups: MatchupTeam[] | undefined,
  rosters: SleeperRoster[],
  users: SleeperUser[]
): Matchup[] {
  if (!matchups) return []

  const grouped = new Map<number, MatchupTeam[]>()
  
  matchups.forEach(m => {
    if (!grouped.has(m.matchup_id)) {
      grouped.set(m.matchup_id, [])
    }
    grouped.get(m.matchup_id)!.push(m)
  })

  const result: Matchup[] = []

  grouped.forEach((teams, matchup_id) => {
    if (teams.length === 2) {
      const [t1, t2] = teams
      
      const roster1 = rosters.find(r => r.roster_id === t1.roster_id)
      const roster2 = rosters.find(r => r.roster_id === t2.roster_id)
      const owner1 = users.find(u => u.user_id === roster1?.owner_id)
      const owner2 = users.find(u => u.user_id === roster2?.owner_id)

      result.push({
        matchup_id,
        team1: {
          roster_id: t1.roster_id,
          points: t1.points || 0,
          owner: owner1,
          roster: roster1,
        },
        team2: {
          roster_id: t2.roster_id,
          points: t2.points || 0,
          owner: owner2,
          roster: roster2,
        },
      })
    }
  })

  return result.sort((a, b) => a.matchup_id - b.matchup_id)
}
