import { useQuery } from '@tanstack/react-query'

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

type PlayersMap = Record<string, NFLPlayer>

async function fetchAllPlayers(): Promise<PlayersMap> {
  const res = await fetch('https://api.sleeper.app/v1/players/nfl')
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json()
}

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchAllPlayers,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (dados mudam pouco)
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias no cache
  })
}

// Helper para pegar info do jogador
export function getPlayerInfo(players: PlayersMap | undefined, playerId: string): NFLPlayer | null {
  if (!players || !playerId) return null
  return players[playerId] || null
}

// Helper para ordenar jogadores por posição
export function sortPlayersByPosition(playerIds: string[], players: PlayersMap): string[] {
  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  
  return [...playerIds].sort((a, b) => {
    const playerA = players[a]
    const playerB = players[b]
    if (!playerA || !playerB) return 0
    
    const posA = positionOrder.indexOf(playerA.position) ?? 99
    const posB = positionOrder.indexOf(playerB.position) ?? 99
    return posA - posB
  })
}
