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
// Exibidas na UI: TKL, SCK, TFL, PRES (qbHits), PD, INT, FF
export interface IDPStats {
  // Stats principais (exibidas na UI)
  tackles: number
  sacks: number
  tfl: number
  qbHits: number          // PRES na UI
  passesDefended: number
  interceptions: number
  forcedFumbles: number
  // Stats adicionais (armazenadas)
  soloTackles: number
  assistTackles: number
  tacklesWithAssist?: number
  tflYards?: number
  sackYards?: number
  intYards?: number
  defensiveTds?: number
  fumbleRecoveryOwn?: number
  fumbleRecoveryOpp?: number
  safeties?: number
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

// Resposta do backend Python (nflverse data)
export interface StatsAPIResponse {
  season: number
  count: number
  players: IDPPlayer[]
  attribution: string
}

// Estado de loading/error
export interface IDPQueryState {
  isLoading: boolean
  isError: boolean
  error?: Error
}

// Tier de qualidade baseado nos thresholds
export type PlayerTier = 'elite' | 'good' | 'average'
