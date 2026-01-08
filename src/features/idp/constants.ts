/**
 * IDP Explorer Constants
 * Constantes, mapeamentos e configurações
 */

import type { FantasyPosition, ESPNPosition, IDPFilters } from './types'

// Backend API URL (nflverse data)
// Em produção, configure via variável de ambiente ou altere o valor default
export const STATS_API = {
  BASE_URL: 'http://localhost:8000',
  DEFENSE: '/api/stats/defense',
  OFFENSE: '/api/stats/offense',
}

// ESPN CDN para fotos (fallback - uso gratuito de CDN público)
export const ESPN_PHOTO_CDN = 'https://a.espncdn.com/i/headshots/nfl/players/full/{id}.png'

// Mapeamento de posições ESPN → Fantasy
export const POSITION_MAP: Record<ESPNPosition, FantasyPosition> = {
  // DL (Defensive Line)
  'DE': 'DL',   // Defensive End
  'DT': 'DL',   // Defensive Tackle
  'NT': 'DL',   // Nose Tackle

  // LB (Linebacker)
  'LB': 'LB',
  'ILB': 'LB',  // Inside Linebacker
  'OLB': 'LB',  // Outside Linebacker
  'MLB': 'LB',  // Middle Linebacker (Mike!)

  // DB (Defensive Back)
  'CB': 'DB',   // Cornerback
  'S': 'DB',    // Safety
  'FS': 'DB',   // Free Safety
  'SS': 'DB',   // Strong Safety
  'DB': 'DB',
}

// Thresholds para classificação de jogadores (baseado no documento)
export const IDP_THRESHOLDS = {
  LB: {
    elite: { tackles: 150, tfl: 10, sacks: 4 },
    good: { tackles: 110, tfl: 6, sacks: 2 },
  },
  DL: {
    elite: { sacks: 12, tackles: 50, tfl: 15 },
    good: { sacks: 8, tackles: 40, tfl: 10 },
  },
  DB: {
    elite: { tackles: 100, pd: 15, interceptions: 5 },
    good: { tackles: 80, pd: 10, interceptions: 3 },
  },
} as const

// Filtros padrão
export const DEFAULT_FILTERS: IDPFilters = {
  positions: ['DL', 'LB', 'DB'],
  minTackles: 0,
  minSacks: 0,
  minTFL: 0,
  minFF: 0,
  minPD: 0,
  season: '2024', // Última temporada com dados completos
  showOnlyAvailable: false,
}

// Sugestões de filtros por posição (do documento)
export const FILTER_SUGGESTIONS = {
  LB: {
    label: 'Mike LB',
    description: 'LBs com 100+ tackles (potenciais Mikes)',
    filters: { minTackles: 100 },
  },
  DL: {
    label: 'Pass Rushers',
    description: 'DLs com 6+ sacks (consistentes)',
    filters: { minSacks: 6 },
  },
  DB: {
    label: 'Box Safeties',
    description: 'DBs com 50+ tackles (atuam perto da linha)',
    filters: { minTackles: 50 },
  },
} as const

// Cores por posição Fantasy
export const IDP_POSITION_COLORS: Record<FantasyPosition, string> = {
  DL: 'text-red-400',
  LB: 'text-yellow-400',
  DB: 'text-blue-400',
}

// Cores de fundo por posição
export const IDP_POSITION_BG: Record<FantasyPosition, string> = {
  DL: 'bg-red-500/20',
  LB: 'bg-yellow-500/20',
  DB: 'bg-blue-500/20',
}

// Cores de tier
export const TIER_COLORS = {
  elite: 'text-yellow-400',   // Dourado
  good: 'text-green-400',     // Verde
  average: 'text-slate-400',  // Cinza
}

// Cache times para React Query
export const IDP_CACHE_TIMES = {
  PLAYERS: 1000 * 60 * 60 * 4,    // 4 horas (backend também cacheia)
}

// Temporadas disponíveis (nflverse data)
export const AVAILABLE_SEASONS = ['2024', '2023', '2022', '2021', '2020']

// Mapeamento de times ESPN → Sleeper (abreviações)
export const ESPN_TO_SLEEPER_TEAM: Record<string, string> = {
  'ARI': 'ARI', // Arizona Cardinals
  'ATL': 'ATL', // Atlanta Falcons
  'BAL': 'BAL', // Baltimore Ravens
  'BUF': 'BUF', // Buffalo Bills
  'CAR': 'CAR', // Carolina Panthers
  'CHI': 'CHI', // Chicago Bears
  'CIN': 'CIN', // Cincinnati Bengals
  'CLE': 'CLE', // Cleveland Browns
  'DAL': 'DAL', // Dallas Cowboys
  'DEN': 'DEN', // Denver Broncos
  'DET': 'DET', // Detroit Lions
  'GB': 'GB',   // Green Bay Packers
  'HOU': 'HOU', // Houston Texans
  'IND': 'IND', // Indianapolis Colts
  'JAX': 'JAX', // Jacksonville Jaguars
  'KC': 'KC',   // Kansas City Chiefs
  'LAC': 'LAC', // Los Angeles Chargers
  'LAR': 'LA',  // Los Angeles Rams (Sleeper usa 'LA')
  'LV': 'LV',   // Las Vegas Raiders
  'MIA': 'MIA', // Miami Dolphins
  'MIN': 'MIN', // Minnesota Vikings
  'NE': 'NE',   // New England Patriots
  'NO': 'NO',   // New Orleans Saints
  'NYG': 'NYG', // New York Giants
  'NYJ': 'NYJ', // New York Jets
  'PHI': 'PHI', // Philadelphia Eagles
  'PIT': 'PIT', // Pittsburgh Steelers
  'SEA': 'SEA', // Seattle Seahawks
  'SF': 'SF',   // San Francisco 49ers
  'TB': 'TB',   // Tampa Bay Buccaneers
  'TEN': 'TEN', // Tennessee Titans
  'WAS': 'WAS', // Washington Commanders
}
