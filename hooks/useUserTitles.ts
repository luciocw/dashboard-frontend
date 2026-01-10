import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'
import type { SleeperLeague, SleeperRoster, BracketGame } from '@/types/sleeper'

/**
 * Título conquistado pelo usuário
 */
export interface UserTitle {
  season: string
  leagueId: string
  leagueName: string
  leagueAvatar?: string
}

/**
 * Busca bracket de vencedores
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
 * Busca liga
 */
async function fetchLeague(leagueId: string): Promise<SleeperLeague | null> {
  const res = await fetch(`${API_URL}/league/${leagueId}`)
  if (!res.ok) return null
  return res.json()
}

/**
 * Verifica se o usuário ganhou uma liga específica
 */
async function checkIfUserWon(
  leagueId: string,
  userId: string,
  leagueName: string,
  leagueAvatar?: string,
  season?: string
): Promise<UserTitle | null> {
  try {
    const [bracket, rosters] = await Promise.all([
      fetchWinnersBracket(leagueId),
      fetchRosters(leagueId)
    ])
    
    if (!bracket || bracket.length === 0) return null
    
    // Encontrar a final (maior round)
    const finalGame = bracket.reduce<BracketGame | null>((max, game) =>
      (game.r > (max?.r || 0)) ? game : max
    , null)
    
    if (!finalGame || !finalGame.w) return null
    
    // Verificar se o usuário é o dono do roster vencedor
    const winnerRoster = rosters.find(r => r.roster_id === finalGame.w)
    
    if (winnerRoster?.owner_id === userId) {
      return {
        season: season || 'Unknown',
        leagueId,
        leagueName,
        leagueAvatar
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Busca todos os títulos de um usuário navegando pelo histórico de cada liga
 */
async function fetchUserTitles(
  leagues: SleeperLeague[],
  userId: string
): Promise<UserTitle[]> {
  const titles: UserTitle[] = []
  const checkedLeagues = new Set<string>()

  // Para cada liga atual, navegar pelo histórico
  for (const league of leagues) {
    let currentLeagueId: string | null = league.league_id
    let currentLeague: SleeperLeague | null = league
    let iterations = 0
    const maxIterations = 10

    while (currentLeagueId && iterations < maxIterations) {
      iterations++
      
      if (checkedLeagues.has(currentLeagueId)) {
        // Já verificamos esta liga, pular para previous
        if (currentLeague?.previous_league_id) {
          currentLeagueId = currentLeague.previous_league_id
          currentLeague = await fetchLeague(currentLeagueId)
        } else {
          break
        }
        continue
      }
      
      checkedLeagues.add(currentLeagueId)
      
      const title = await checkIfUserWon(
        currentLeagueId,
        userId,
        currentLeague?.name || league.name,
        currentLeague?.avatar || league.avatar,
        currentLeague?.season
      )
      
      if (title) {
        titles.push(title)
      }
      
      // Ir para temporada anterior
      if (currentLeague?.previous_league_id) {
        currentLeagueId = currentLeague.previous_league_id
        currentLeague = await fetchLeague(currentLeagueId)
      } else {
        break
      }
    }
  }

  // Ordenar por temporada (mais recente primeiro)
  return titles.sort((a, b) => b.season.localeCompare(a.season))
}

/**
 * Hook para buscar títulos do usuário
 */
export function useUserTitles(leagues: SleeperLeague[] | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['userTitles', userId, leagues?.map(l => l.league_id).join(',')],
    queryFn: () => fetchUserTitles(leagues!, userId!),
    enabled: !!leagues && leagues.length > 0 && !!userId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}
