import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import { ApiError } from '@/utils/errors'
import type { SleeperUser, SleeperLeague, LeagueData } from '@/types/sleeper'

/**
 * Busca dados de um usuário pelo username
 * @param username - Username do Sleeper (case insensitive)
 * @throws {ApiError} Se usuário não encontrado (404) ou erro de rede
 */
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

/**
 * Busca ligas de um usuário para uma temporada específica
 * @param userId - ID do usuário no Sleeper
 * @param season - Ano da temporada (ex: "2025")
 */
async function fetchLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
  const endpoint = `${API_URL}/user/${userId}/leagues/nfl/${season}`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar ligas', res.status, endpoint)
  }
  
  return res.json()
}

/**
 * Busca detalhes completos de uma liga (dados, rosters e usuários)
 * @param leagueId - ID da liga no Sleeper
 */
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

/**
 * Hook para buscar dados do usuário no Sleeper
 * @param username - Username do Sleeper
 * @returns Query result com dados do usuário
 * @example
 * const { data: user, isLoading, error } = useSleeperUser('luciocw')
 */
export function useSleeperUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
    retry: false,
    staleTime: CACHE_TIMES.USER,
  })
}

/**
 * Hook para buscar ligas do usuário
 * @param userId - ID do usuário (retornado por useSleeperUser)
 * @param season - Ano da temporada
 * @returns Query result com array de ligas
 * @example
 * const { data: leagues } = useSleeperLeagues(user?.user_id, '2025')
 */
export function useSleeperLeagues(userId: string | undefined, season: string) {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: () => fetchLeagues(userId!, season),
    enabled: !!userId,
    staleTime: CACHE_TIMES.LEAGUES,
  })
}

/**
 * Hook para buscar detalhes completos de uma liga
 * @param leagueId - ID da liga
 * @returns Query result com LeagueData (league, rosters, users)
 * @example
 * const { data } = useLeagueData('123456789')
 * // data.league, data.rosters, data.users
 */
export function useLeagueData(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['leagueData', leagueId],
    queryFn: () => fetchLeagueDetails(leagueId!),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}
