/**
 * Environment bindings for the Worker
 */
export interface Env {
  // KV namespace for caching
  CACHE: KVNamespace;

  // Environment variables
  RAPIDAPI_KEY: string;
  PRIMARY_SOURCE: string;
  CACHE_TTL_TANK01: string;
  CACHE_TTL_NFLVERSE: string;
  DEBUG: string;
}

/**
 * Player defensive stats
 */
export interface DefensiveStats {
  tackles: number;
  sacks: number;
  tfl: number;
  qbHits: number;
  passesDefended: number;
  interceptions: number;
  forcedFumbles: number;
  soloTackles: number;
  assistTackles: number;
  tacklesWithAssist: number;
  tflYards: number;
  sackYards: number;
  intYards: number;
  defensiveTds: number;
  fumbleRecoveryOwn: number;
  fumbleRecoveryOpp: number;
  safeties: number;
}

/**
 * Defensive player data
 */
export interface DefensivePlayer {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  photoUrl: string;
  espnPosition: string;
  fantasyPosition: string;
  age: number | null;
  experience: number | null;
  jerseyNumber: string | null;
  stats: DefensiveStats;
}

/**
 * Offensive stats
 */
export interface OffensiveStats {
  // Passing
  completions: number;
  attempts: number;
  passingYards: number;
  passingTds: number;
  interceptions: number;
  passerRating: number;
  passingAirYards: number;
  passingYac: number;
  passingFirstDowns: number;
  sacks: number;
  sackYards: number;
  // Rushing
  carries: number;
  rushingYards: number;
  rushingTds: number;
  rushingFirstDowns: number;
  // Receiving
  targets: number;
  receptions: number;
  receivingYards: number;
  receivingTds: number;
  receivingAirYards: number;
  receivingYac: number;
  receivingFirstDowns: number;
  // Fumbles
  fumbles: number;
  fumblesLost: number;
  // Advanced
  targetShare: number;
  airYardsShare: number;
  wopr: number;
  racr: number;
  pacr: number;
  // Fantasy
  fantasyPoints: number;
  fantasyPointsPpr: number;
}

/**
 * Offensive player data
 */
export interface OffensivePlayer {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  photoUrl: string;
  position: string;
  age: number | null;
  experience: number | null;
  jerseyNumber: string | null;
  stats: OffensiveStats;
}

/**
 * API Response wrapper
 */
export interface StatsResponse<T> {
  source: string;
  cached: boolean;
  cache_age_seconds: number;
  count: number;
  players: T[];
  season?: number;
  attribution?: string;
}

/**
 * Tank01 API player data structure
 */
export interface Tank01Player {
  playerID?: string;
  espnID?: string;
  longName?: string;
  espnName?: string;
  team?: string;
  pos?: string;
  age?: string | number;
  exp?: string | number;
  jerseyNum?: string | number;
  espnHeadshot?: string;
  stats?: {
    Defense?: {
      totalTackles?: string | number;
      soloTackles?: string | number;
      sacks?: string | number;
      tfl?: string | number;
      qbHits?: string | number;
      passDeflections?: string | number;
      defensiveInterceptions?: string | number;
      forcedFumbles?: string | number;
      fumblesRecovered?: string | number;
      defTD?: string | number;
    };
    Passing?: {
      passCompletions?: string | number;
      passAttempts?: string | number;
      passYds?: string | number;
      passTD?: string | number;
      int?: string | number;
      sacked?: string | number;
    };
    Rushing?: {
      carries?: string | number;
      rushYds?: string | number;
      rushTD?: string | number;
    };
    Receiving?: {
      targets?: string | number;
      receptions?: string | number;
      recYds?: string | number;
      recTD?: string | number;
    };
  };
}
