import type { SleeperRoster, SleeperUser } from '@/types/sleeper'

export interface PowerRanking {
  rank: number
  rosterId: number
  owner: SleeperUser | undefined
  roster: SleeperRoster
  wins: number
  losses: number
  totalPoints: number
  avgPoints: number
  powerScore: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * Calcula Power Rankings baseado em múltiplos fatores
 */
export function calculatePowerRankings(
  rosters: SleeperRoster[],
  users: SleeperUser[]
): PowerRanking[] {
  const allPoints = rosters.map(r => r.settings.fpts || 0)
  const maxTotalPoints = Math.max(...allPoints, 1)
  const minTotalPoints = Math.min(...allPoints, 0)

  const rankings: PowerRanking[] = rosters.map(roster => {
    const owner = users.find(u => u.user_id === roster.owner_id)
    const wins = roster.settings.wins || 0
    const losses = roster.settings.losses || 0
    const totalGames = wins + losses
    const totalPoints = roster.settings.fpts || 0
    const avgPoints = totalGames > 0 ? totalPoints / totalGames : 0

    // Normalizar valores (0-100)
    const normalizedPoints = maxTotalPoints > minTotalPoints 
      ? ((totalPoints - minTotalPoints) / (maxTotalPoints - minTotalPoints)) * 100 
      : 50
    
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 50
    const normalizedAvg = avgPoints > 0 ? Math.min((avgPoints / 150) * 100, 100) : 50

    // Power Score
    const powerScore = (
      normalizedPoints * 0.40 +
      winRate * 0.30 +
      normalizedAvg * 0.30
    )

    return {
      rank: 0,
      rosterId: roster.roster_id,
      owner,
      roster,
      wins,
      losses,
      totalPoints,
      avgPoints,
      powerScore,
      trend: 'stable' as const,
    }
  })

  // Ordenar por powerScore
  rankings.sort((a, b) => b.powerScore - a.powerScore)

  // Atribuir ranks e calcular trend
  rankings.forEach((r, index) => {
    r.rank = index + 1
    
    const wlRank = [...rosters]
      .sort((a, b) => {
        const aWins = a.settings.wins || 0
        const bWins = b.settings.wins || 0
        if (bWins !== aWins) return bWins - aWins
        return (b.settings.fpts || 0) - (a.settings.fpts || 0)
      })
      .findIndex(roster => roster.roster_id === r.rosterId) + 1

    if (r.rank < wlRank - 1) {
      r.trend = 'up'
    } else if (r.rank > wlRank + 1) {
      r.trend = 'down'
    }
  })

  return rankings
}
