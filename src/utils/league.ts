import type { SleeperLeague } from '@/types/sleeper'

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'error'

interface LeagueTag {
  label: string
  variant: BadgeVariant
}

/**
 * Retorna o tipo da liga (Redraft, Keeper, Dynasty)
 */
export function getLeagueType(settings: SleeperLeague['settings']): string {
  switch (settings?.type) {
    case 0: return 'Redraft'
    case 1: return 'Keeper'
    case 2: return 'Dynasty'
    default: return 'Redraft'
  }
}

/**
 * Gera as tags da liga (DYNASTY, PPR, SF, IDP, etc)
 */
export function getLeagueTags(league: SleeperLeague): LeagueTag[] {
  const tags: LeagueTag[] = []
  const positions = league.roster_positions || []
  
  const type = getLeagueType(league.settings)
  if (type === 'Dynasty') tags.push({ label: 'DYNASTY', variant: 'success' })
  else if (type === 'Keeper') tags.push({ label: 'KEEPER', variant: 'warning' })
  else tags.push({ label: 'REDRAFT', variant: 'default' })
  
  tags.push({ label: 'PPR', variant: 'info' })
  
  if (positions.includes('SUPER_FLEX')) tags.push({ label: 'SF', variant: 'error' })
  
  if (positions.some(p => ['DL', 'LB', 'DB', 'IDP_FLEX'].includes(p))) {
    tags.push({ label: 'IDP', variant: 'warning' })
  }
  
  tags.push({ label: `${league.total_rosters}T`, variant: 'default' })
  
  return tags
}

/**
 * Formata as posições do lineup (ex: QB, 2RB, 2WR, TE, 2FLEX)
 */
export function formatLineup(positions: string[]): string[] {
  const counts: Record<string, number> = {}
  positions.forEach(pos => {
    if (pos !== 'BN') {
      counts[pos] = (counts[pos] || 0) + 1
    }
  })
  return Object.entries(counts).map(([pos, count]) => 
    count > 1 ? `${count}${pos}` : pos
  )
}
