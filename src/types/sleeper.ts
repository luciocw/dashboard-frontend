export interface SleeperUser {
  user_id: string
  username: string
  display_name?: string
  avatar?: string
}

export interface SleeperLeague {
  league_id: string
  name: string
  avatar?: string
  season: string
  total_rosters: number
  settings?: {
    type?: number
    wins?: number
    losses?: number
    ties?: number
  }
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string
  players: string[]
  starters: string[]
  reserve?: string[]
  taxi?: string[]
  settings: {
    wins: number
    losses: number
    ties: number
    fpts: number
  }
}
