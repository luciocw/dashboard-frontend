export interface SleeperUser {
  user_id: string
  username: string
  display_name?: string
  avatar?: string
}

export interface LeagueSettings {
  wins?: number
  losses?: number
  ties?: number
  fpts?: number
  fpts_decimal?: number
  type?: number
}

export interface SleeperLeague {
  league_id: string
  name: string
  avatar?: string
  season: string
  total_rosters: number
  status: string
  settings: LeagueSettings
  roster_positions?: string[]
}

export interface RosterSettings {
  wins: number
  losses: number
  ties: number
  fpts: number
  fpts_decimal?: number
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string
  league_id: string
  players: string[] | null
  starters: string[] | null
  taxi: string[] | null
  reserve: string[] | null
  settings: RosterSettings
}

export interface LeagueData {
  league: SleeperLeague
  rosters: SleeperRoster[]
  users: SleeperUser[]
}

export interface StandingTeam {
  id: number
  name: string
  avatar?: string
  wins: number
  losses: number
  ties: number
  fpts: number
  winRate: number
}
