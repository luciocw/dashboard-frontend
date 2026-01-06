import { useQuery } from '@tanstack/react-query'
import type { SleeperUser, SleeperLeague, LeagueData } from '@/types/sleeper'

const API = 'https://api.sleeper.app/v1'

async function fetchUser(username: string): Promise<SleeperUser> {
  const res = await fetch(`${API}/user/${username}`)
  if (!res.ok) throw new Error('User not found')
  return res.json()
}

async function fetchLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
  const res = await fetch(`${API}/user/${userId}/leagues/nfl/${season}`)
  if (!res.ok) throw new Error('Leagues not found')
  return res.json()
}

async function fetchLeagueDetails(leagueId: string): Promise<LeagueData> {
  const [leagueRes, rostersRes, usersRes] = await Promise.all([
    fetch(`${API}/league/${leagueId}`),
    fetch(`${API}/league/${leagueId}/rosters`),
    fetch(`${API}/league/${leagueId}/users`),
  ])
  if (!leagueRes.ok || !rostersRes.ok || !usersRes.ok) {
    throw new Error('Failed to fetch league details')
  }
  return {
    league: await leagueRes.json(),
    rosters: await rostersRes.json(),
    users: await usersRes.json(),
  }
}

export function useSleeperUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
    retry: false,
    staleTime: 1000 * 60 * 60 * 4,
  })
}

export function useSleeperLeagues(userId: string | undefined, season: string) {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: () => fetchLeagues(userId!, season),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 4,
  })
}

export function useLeagueData(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['leagueData', leagueId],
    queryFn: () => fetchLeagueDetails(leagueId!),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 60 * 2,
  })
}
