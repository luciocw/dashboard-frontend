import { useQuery } from '@tanstack/react-query'
import type { SleeperRoster, SleeperUser } from '@/types/sleeper'
import { API_URL } from '@/constants'

interface MyRosterData {
  roster: SleeperRoster | null
  users: SleeperUser[]
}

async function fetchMyRoster(leagueId: string, userId: string): Promise<MyRosterData> {
  const [rostersRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/league/${leagueId}/rosters`),
    fetch(`${API_URL}/league/${leagueId}/users`),
  ])
  
  if (!rostersRes.ok || !usersRes.ok) {
    throw new Error('Failed to fetch roster data')
  }
  
  const rosters: SleeperRoster[] = await rostersRes.json()
  const users: SleeperUser[] = await usersRes.json()
  
  const myRoster = rosters.find(r => r.owner_id === userId) || null
  
  return { roster: myRoster, users }
}

export function useMyRoster(leagueId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['myRoster', leagueId, userId],
    queryFn: () => fetchMyRoster(leagueId!, userId!),
    enabled: !!leagueId && !!userId,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
  })
}
