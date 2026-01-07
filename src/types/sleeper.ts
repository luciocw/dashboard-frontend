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
  leg?: number // Semana atual
}

/**
 * Configurações de pontuação da liga
 * Valores representam pontos por stat
 */
export interface ScoringSettings {
  // IDP - Tackles
  tkl?: number           // Tackle (geral - stacks com solo/ast)
  tkl_solo?: number      // Solo Tackle
  tkl_ast?: number       // Assisted Tackle
  tkl_loss?: number      // Tackle for Loss

  // IDP - Big Plays
  sack?: number          // Sack
  int?: number           // Interception
  pass_def?: number      // Pass Defended
  ff?: number            // Forced Fumble
  fum_rec?: number       // Fumble Recovery
  idp_td?: number        // IDP Touchdown
  safe?: number          // Safety
  blk_kick?: number      // Blocked Kick

  // Offense - Passing
  pass_yd?: number       // Passing Yards (geralmente 0.04)
  pass_td?: number       // Passing TD
  pass_int?: number      // Interception thrown (negativo)
  pass_2pt?: number      // 2-point conversion pass

  // Offense - Rushing
  rush_yd?: number       // Rushing Yards (geralmente 0.1)
  rush_td?: number       // Rushing TD
  rush_2pt?: number      // 2-point conversion rush

  // Offense - Receiving
  rec?: number           // Reception (PPR)
  rec_yd?: number        // Receiving Yards (geralmente 0.1)
  rec_td?: number        // Receiving TD
  rec_2pt?: number       // 2-point conversion rec
  bonus_rec_te?: number  // TE Premium bonus

  // Kicking
  fgm?: number           // Field Goal Made
  fgmiss?: number        // Field Goal Missed (negativo)
  xpm?: number           // Extra Point Made
  xpmiss?: number        // Extra Point Missed (negativo)

  // Misc
  fum_lost?: number      // Fumble Lost (negativo)
  fum?: number           // Fumble

  // Permite campos adicionais
  [key: string]: number | undefined
}

export interface SleeperLeague {
  league_id: string
  name: string
  avatar?: string
  season: string
  total_rosters: number
  status: string
  settings: LeagueSettings
  scoring_settings?: ScoringSettings
  roster_positions?: string[]
  previous_league_id?: string | null
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
