/**
 * IDP Explorer Types
 * Tipos para busca e seleção de Individual Defensive Players
 */

// Posições de Fantasy (simplificadas)
export type FantasyPosition = 'DL' | 'LB' | 'DB'

// Posições ESPN (detalhadas)
export type ESPNPosition =
  | 'DE' | 'DT' | 'NT'           // DL
  | 'LB' | 'ILB' | 'OLB' | 'MLB' // LB
  | 'CB' | 'S' | 'FS' | 'SS' | 'DB' // DB

// Stats de um jogador IDP
export interface IDPStats {
  tackles: number
  soloTackles: number
  assistTackles: number
  sacks: number
  tfl: number // stuffs na ESPN
  forcedFumbles: number
  passesDefended: number
  interceptions: number
}

// Jogador IDP completo
export interface IDPPlayer {
  id: string
  name: string
  team: string
  teamAbbr: string
  photoUrl?: string
  espnPosition: ESPNPosition
  fantasyPosition: FantasyPosition
  age?: number
  experience?: number
  jerseyNumber?: string
  stats: IDPStats
  // Integração Sleeper
  sleeperPlayerId?: string
  isInMyRoster?: boolean
}

// Filtros para busca
export interface IDPFilters {
  positions: FantasyPosition[]
  minTackles: number
  minSacks: number
  minTFL: number
  minFF: number
  minPD: number
  season: string
  showOnlyAvailable: boolean // Não mostrar jogadores que já tenho
}

// Resposta do endpoint de leaders ESPN
export interface ESPNLeadersResponse {
  leaders: {
    categories: ESPNLeaderCategory[]
  }
}

export interface ESPNLeaderCategory {
  name: string
  displayName: string
  leaders: ESPNLeader[]
}

export interface ESPNLeader {
  displayValue: string
  value: number
  athlete: {
    $ref: string
    id: string
  }
  team: {
    $ref: string
  }
}

// Resposta do endpoint de atleta ESPN
export interface ESPNAthleteResponse {
  id: string
  displayName: string
  firstName: string
  lastName: string
  jersey?: string
  age?: number
  experience?: {
    years: number
  }
  position: {
    id: string
    name: string
    abbreviation: string
  }
  team?: {
    $ref: string
  }
  headshot?: {
    href: string
  }
}

// Resposta do endpoint de stats ESPN
export interface ESPNStatsResponse {
  splits: {
    categories: ESPNStatsCategory[]
  }
}

export interface ESPNStatsCategory {
  name: string
  stats: ESPNStat[]
}

export interface ESPNStat {
  name: string
  displayName: string
  value: number
}

// Estado de loading/error
export interface IDPQueryState {
  isLoading: boolean
  isError: boolean
  error?: Error
}

// Tier de qualidade baseado nos thresholds
export type PlayerTier = 'elite' | 'good' | 'average'
