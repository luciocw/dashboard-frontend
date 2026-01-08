/**
 * Trade Calculator Types
 */

// Posições de jogadores
export type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DL' | 'LB' | 'DB'

// Posições para filtro (inclui PICKS)
export type FilterPosition = PlayerPosition | 'PICKS' | 'ALL'

// Jogador no trade
export interface TradePlayer {
  type: 'player'
  playerId: string
  name: string
  position: PlayerPosition
  team: string
  age?: number
  value: number // 0-100
}

// Pick no trade
export interface TradePick {
  type: 'pick'
  id: string // e.g., "2026-1-early"
  year: number
  round: number
  range: 'early' | 'mid' | 'late' | null // null para rounds 2+
  value: number // 0-100
  label: string // e.g., "2026 1st (Early)"
}

// Item no trade (pode ser jogador ou pick)
export type TradeItem = TradePlayer | TradePick

// Estado de um lado do trade
export interface TradeSideState {
  items: TradeItem[]
  totalValue: number
}

// Estado completo do trade
export interface TradeState {
  sideA: TradeSideState
  sideB: TradeSideState
}

// Resultado do trade
export interface TradeResult {
  winner: 'A' | 'B' | 'even'
  difference: number
  differencePercent: number
  sideATotal: number
  sideBTotal: number
}

// Jogador da Sleeper API com valor anexado
export interface SleeperPlayerWithValue {
  player_id: string
  first_name: string
  last_name: string
  full_name?: string
  position?: string
  team?: string
  age?: number
  value: number
}
