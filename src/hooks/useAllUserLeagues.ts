import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import type { SleeperLeague } from '@/types/sleeper'

/**
 * Busca ligas de uma temporada
 */
async function fetchLeaguesBySeason(userId: string, season: string): Promise<SleeperLeague[]> {
  const res = await fetch(`${API_URL}/user/${userId}/leagues/nfl/${season}`)
  if (!res.ok) return []
  return res.json()
}

/**
 * Busca ligas de TODAS as temporadas (últimos 10 anos)
 */
async function fetchAllUserLeagues(userId: string): Promise<SleeperLeague[]> {
  const currentYear = new Date().getFullYear()
  const seasons = Array.from({ length: 10 }, (_, i) => String(currentYear - i))
  
  const results = await Promise.all(
    seasons.map(season => fetchLeaguesBySeason(userId, season))
  )
  
  // Flatten e remover duplicatas por league_id
  const allLeagues = results.flat()
  const uniqueLeagues = new Map<string, SleeperLeague>()
  
  allLeagues.forEach(league => {
    // Manter a versão mais recente de cada liga
    if (!uniqueLeagues.has(league.league_id)) {
      uniqueLeagues.set(league.league_id, league)
    }
  })
  
  return Array.from(uniqueLeagues.values())
}

/**
 * Hook para buscar TODAS as ligas do usuário (todas temporadas)
 */
export function useAllUserLeagues(userId: string | undefined) {
  return useQuery({
    queryKey: ['allUserLeagues', userId],
    queryFn: () => fetchAllUserLeagues(userId!),
    enabled: !!userId,
    staleTime: CACHE_TIMES.LEAGUES,
  })
}
