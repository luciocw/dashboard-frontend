import type { SleeperRoster, SleeperUser, StandingTeam } from '@/types/sleeper'

export function calculateStandings(
  rosters: SleeperRoster[],
  users: SleeperUser[]
): StandingTeam[] {
  return rosters
    .map((roster) => {
      const owner = users.find((u) => u.user_id === roster.owner_id)
      const fpts = roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100
      const wins = roster.settings.wins
      const losses = roster.settings.losses
      const totalGames = wins + losses
      return {
        id: roster.roster_id,
        name: owner?.display_name || owner?.username || 'Time Sem Dono',
        avatar: owner?.avatar,
        wins,
        losses,
        ties: roster.settings.ties || 0,
        fpts,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      }
    })
    .sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.fpts - a.fpts)
}
