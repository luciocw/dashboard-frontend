import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import { ApiError } from '@/utils/errors'
import type { SleeperUser, SleeperLeague, LeagueData } from '@/types/sleeper'

async function fetchUser(username: string): Promise<SleeperUser> {
  const endpoint = `${API_URL}/user/${username}`
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
  const endpoint = `${API_URL}/user/${userId}/leagues/nfl/${season}`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar ligas', res.status, endpoint)
  }
  
  return res.json()
}

async function fetchLeagueDetails(leagueId: string): Promise<LeagueData> {
  const [leagueRes, rostersRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/league/${leagueId}`),
    fetch(`${API_URL}/league/${leagueId}/rosters`),
    fetch(`${API_URL}/league/${leagueId}/users`),
  ])
  
  if (!leagueRes.ok || !rostersRes.ok || !usersRes.ok) {
    throw new ApiError(
      'Erro ao buscar detalhes da liga',
      leagueRes.status || rostersRes.status || usersRes.status,
      `${API_URL}/league/${leagueId}`
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
    staleTime: CACHE_TIMES.USER,
  })
}

export function useSleeperLeagues(userId: string | undefined, season: string) {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: () => fetchLeagues(userId!, season),
    enabled: !!userId,
    staleTime: CACHE_TIMES.LEAGUES,
  })
}

export function useLeagueData(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['leagueData', leagueId],
    queryFn: () => fetchLeagueDetails(leagueId!),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}
