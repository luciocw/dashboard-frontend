/**
 * IDP Explorer Constants
 * Constantes, mapeamentos e configurações
 */

import type { FantasyPosition, ESPNPosition, IDPFilters } from './types'

// ESPN API URLs
export const ESPN_API = {
  // Leaders por categoria (tackles, sacks, PD, INT)
  LEADERS: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{season}/types/2/leaders',
  // Detalhes do atleta
  ATHLETE: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/{id}',
  // Stats do atleta por TEMPORADA (não carreira!)
  STATS_SEASON: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{season}/types/2/athletes/{id}/statistics/0',
  // Stats de carreira (backup)
  STATS_CAREER: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/{id}/statistics/0',
  // CDN para fotos
  PHOTO: 'https://a.espncdn.com/i/headshots/nfl/players/full/{id}.png',
}

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
  season: '2025', // Temporada atual
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

// Cache times
export const IDP_CACHE_TIMES = {
  LEADERS: 1000 * 60 * 60 * 4,    // 4 horas
  ATHLETE: 1000 * 60 * 60 * 24,   // 24 horas (dados mudam pouco)
  STATS: 1000 * 60 * 60 * 4,      // 4 horas
}

// Categorias de stats defensivas no endpoint de leaders
export const ESPN_STAT_CATEGORIES = {
  TACKLES: 'totalTackles',
  SACKS: 'sacks',
  PASSES_DEFENDED: 'passesDefended',
  INTERCEPTIONS: 'interceptions',
} as const

// Limite de jogadores a buscar por categoria
export const LEADERS_LIMIT = 100

// Temporadas disponíveis
export const AVAILABLE_SEASONS = ['2025', '2024', '2023', '2022', '2021', '2020']

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
