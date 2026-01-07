import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES, POSITION_ORDER } from '@/constants'
import { ApiError } from '@/utils/errors'

/**
 * Representa um jogador da NFL
 */
export interface NFLPlayer {
  player_id: string
  first_name: string
  last_name: string
  full_name?: string
  position: string
  team: string | null
  age?: number
  years_exp?: number
  status?: string
  injury_status?: string
}

/**
 * Mapa de jogadores indexado por player_id
 */
export type PlayersMap = Record<string, NFLPlayer>

/**
 * Busca todos os jogadores da NFL
 * @returns Mapa de jogadores indexado por ID
 */
async function fetchAllPlayers(): Promise<PlayersMap> {
  const endpoint = `${API_URL}/players/nfl`
  const res = await fetch(endpoint)
  
  if (!res.ok) {
    throw new ApiError('Erro ao buscar jogadores', res.status, endpoint)
  }
  
  return res.json()
}

/**
 * Hook para buscar todos os jogadores da NFL
 * Cache de 24h pois dados mudam pouco
 * @returns Query result com mapa de jogadores
 * @example
 * const { data: players } = usePlayers()
 * const player = players?.['4046'] // Busca por ID
 */
export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchAllPlayers,
    staleTime: CACHE_TIMES.PLAYERS,
    gcTime: CACHE_TIMES.PLAYERS_GC,
  })
}

/**
 * Retorna informações de um jogador pelo ID
 * @param players - Mapa de jogadores
 * @param playerId - ID do jogador
 * @returns Dados do jogador ou null se não encontrado
 */
export function getPlayerInfo(players: PlayersMap | undefined, playerId: string): NFLPlayer | null {
  if (!players || !playerId) return null
  return players[playerId] || null
}

/**
 * Ordena IDs de jogadores por posição (QB > RB > WR > TE > K > DEF)
 * @param playerIds - Array de IDs de jogadores
 * @param players - Mapa de jogadores
 * @returns Array de IDs ordenado por posição
 */
export function sortPlayersByPosition(playerIds: string[], players: PlayersMap): string[] {
  return [...playerIds].sort((a, b) => {
    const playerA = players[a]
    const playerB = players[b]
    if (!playerA || !playerB) return 0
    
    const posA = POSITION_ORDER.indexOf(playerA.position) ?? 99
    const posB = POSITION_ORDER.indexOf(playerB.position) ?? 99
    return posA - posB
  })
}
