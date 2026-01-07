import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/utils/errors'
import type { SleeperUser, SleeperLeague, LeagueData } from '@/types/sleeper'

const API = 'https://api.sleeper.app/v1'

async function fetchUser(username: string): Promise<SleeperUser> {
  const endpoint = `${API}/user/${username}`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new ApiError('Usuário não encontrado', 404, endpoint)
    }
    throw new ApiError('Erro ao buscar usuário', res.status, endpoint)
  }
  
  return res.json()
}

async function fetchLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
  const endpoint = `${API}/user/${userId}/leagues/nfl/${season}`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar ligas', res.status, endpoint)
  }
  
  return res.json()
}

async function fetchLeagueDetails(leagueId: string): Promise<LeagueData> {
  const [leagueRes, rostersRes, usersRes] = await Promise.all([
    fetch(`${API}/league/${leagueId}`),
    fetch(`${API}/league/${leagueId}/rosters`),
    fetch(`${API}/league/${leagueId}/users`),
  ])
  
  if (!leagueRes.ok || !rostersRes.ok || !usersRes.ok) {
    throw new ApiError(
      'Erro ao buscar detalhes da liga',
      leagueRes.status || rostersRes.status || usersRes.status,
      `${API}/league/${leagueId}`
    )
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
