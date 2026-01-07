import type { PlayersMap } from '@/hooks/usePlayers'

/**
 * Conta jogadores por posição
 */
export function countByPosition(
  playerIds: string[], 
  players: PlayersMap
): Record<string, number> {
  const counts: Record<string, number> = {}
  playerIds.forEach(id => {
    const player = players[id]
    if (player?.position) {
      counts[player.position] = (counts[player.position] || 0) + 1
    }
  })
  return counts
}

/**
 * Calcula idade média do roster
 */
export function calculateAvgAge(
  playerIds: string[], 
  players: PlayersMap
): number {
  const ages = playerIds
    .map(id => players[id]?.age)
    .filter((age): age is number => typeof age === 'number')
  if (ages.length === 0) return 0
  return ages.reduce((sum, age) => sum + age, 0) / ages.length
}

/**
 * Agrupa jogadores por posição
 */
export function groupByPosition(
  playerIds: string[], 
  players: PlayersMap
): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  
  playerIds.forEach(id => {
    const player = players[id]
    if (player) {
      const pos = player.position || 'UNKNOWN'
      if (!groups[pos]) groups[pos] = []
      groups[pos].push(id)
    }
  })
  
  return groups
}
