/**
 * Trade Calculator Feature
 * Exports públicos do módulo
 */

// Componente principal
export { TradeCalculator } from './components/TradeCalculator'

// Hooks (caso precise usar externamente)
export { useTradeCalculator } from './hooks/useTradeCalculator'
export { usePlayerSearch } from './hooks/usePlayerSearch'

// Types
export type {
  TradePlayer,
  TradePick,
  TradeItem,
  TradeResult,
  PlayerPosition,
  FilterPosition,
} from './types'
