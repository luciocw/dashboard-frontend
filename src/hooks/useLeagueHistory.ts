import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import { ApiError } from '@/utils/errors'
import type { SleeperLeague, SleeperRoster, SleeperUser, BracketGame } from '@/types/sleeper'

/**
 * Informações de um campeão
 */
export interface Champion {
  season: string
  oderId: string
  ownerName: string
  ownerAvatar?: string
  rosterId: number
}

/**
 * Busca a liga anterior (previous_league_id)
 */
async function fetchLeague(leagueId: string): Promise<SleeperLeague> {
  const res = await fetch(`${API_URL}/league/${leagueId}`)
  if (!res.ok) throw new ApiError('Erro ao buscar liga', res.status)
  return res.json()
}

/**
 * Busca vencedores do playoff (winner_roster_id está no bracket)
 */
async function fetchWinnersBracket(leagueId: string): Promise<BracketGame[]> {
  const res = await fetch(`${API_URL}/league/${leagueId}/winners_bracket`)
  if (!res.ok) return []
  return res.json()
}

/**
 * Busca rosters de uma liga
 */
async function fetchRosters(leagueId: string): Promise<SleeperRoster[]> {
  const res = await fetch(`${API_URL}/league/${leagueId}/rosters`)
  if (!res.ok) return []
  return res.json()
}

/**
 * Busca usuários de uma liga
 */
async function fetchUsers(leagueId: string): Promise<SleeperUser[]> {
  const res = await fetch(`${API_URL}/league/${leagueId}/users`)
  if (!res.ok) return []
  return res.json()
}

/**
 * Busca histórico completo de campeões navegando pelas temporadas anteriores
 */
async function fetchChampionsHistory(leagueId: string): Promise<Champion[]> {
  const champions: Champion[] = []
  let currentLeagueId: string | null = leagueId
  let iterations = 0
  const maxIterations = 10 // Máximo de 10 temporadas para evitar loop infinito

  while (currentLeagueId && iterations < maxIterations) {
    iterations++
    
    try {
      // Buscar dados da liga
      const league = await fetchLeague(currentLeagueId)
      
      // Buscar bracket de vencedores
      const bracket = await fetchWinnersBracket(currentLeagueId)
      
      // Encontrar a final (último jogo do bracket - maior round)
      if (bracket && bracket.length > 0) {
        const finalGame = bracket.reduce<BracketGame | null>((max, game) =>
          (game.r > (max?.r || 0)) ? game : max
        , null)
        
        if (finalGame && finalGame.w) {
          // Buscar rosters e users para pegar o nome do campeão
          const [rosters, users] = await Promise.all([
            fetchRosters(currentLeagueId),
            fetchUsers(currentLeagueId)
          ])
          
          const winnerRoster = rosters.find(r => r.roster_id === finalGame.w)
          const winnerUser = users.find(u => u.user_id === winnerRoster?.owner_id)
          
          if (winnerUser) {
            champions.push({
              season: league.season,
              oderId: winnerUser.user_id,
              ownerName: winnerUser.display_name || winnerUser.username,
              ownerAvatar: winnerUser.avatar,
              rosterId: finalGame.w
            })
          }
        }
      }
      
      // Ir para a temporada anterior
      currentLeagueId = league.previous_league_id || null
      
    } catch {
      break
    }
  }

  return champions
}

/**
 * Hook para buscar histórico de campeões da liga
 * @param leagueId - ID da liga atual
 */
export function useLeagueHistory(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['leagueHistory', leagueId],
    queryFn: () => fetchChampionsHistory(leagueId!),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}
