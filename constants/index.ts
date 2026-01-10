// API URLs (configuráveis via variáveis de ambiente)
export const API_URL = process.env.NEXT_PUBLIC_SLEEPER_API_URL || 'https://api.sleeper.app/v1'
export const SLEEPER_CDN = process.env.NEXT_PUBLIC_SLEEPER_CDN_URL || 'https://sleepercdn.com'
export const IDP_API_URL = process.env.NEXT_PUBLIC_IDP_API_URL || 'https://nfl-stats-api.luciocw.workers.dev'
export const DYNASTY_PULSE_API_URL = process.env.NEXT_PUBLIC_DYNASTY_PULSE_API_URL || 'http://localhost:8000'

// Cache times (em ms)
export const CACHE_TIMES = {
  USER: 1000 * 60 * 60 * 4,        // 4 horas
  LEAGUES: 1000 * 60 * 60 * 4,     // 4 horas
  LEAGUE_DATA: 1000 * 60 * 60 * 2, // 2 horas
  ROSTERS: 1000 * 60 * 60 * 2,     // 2 horas
  PLAYERS: 1000 * 60 * 60 * 24,    // 24 horas
  PLAYERS_GC: 1000 * 60 * 60 * 24 * 7, // 7 dias
  DYNASTY_PULSE: 1000 * 60 * 60 * 1,   // 1 hora
  DYNASTY_PULSE_GC: 1000 * 60 * 60 * 4, // 4 horas
}

// Cores por posição
export const POSITION_COLORS: Record<string, string> = {
  QB: 'text-red-400',
  RB: 'text-green-400',
  WR: 'text-blue-400',
  TE: 'text-yellow-400',
  K: 'text-purple-400',
  DEF: 'text-orange-400',
  DL: 'text-orange-400',
  LB: 'text-orange-400',
  DB: 'text-orange-400',
}

// Ordem das posições para ordenação
export const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DL', 'LB', 'DB', 'DEF']

// Posições para exibir nos cards
export const DISPLAY_POSITIONS = ['QB', 'RB', 'WR', 'TE']
