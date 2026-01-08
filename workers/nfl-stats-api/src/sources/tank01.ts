/**
 * Tank01 NFL API data source (RapidAPI)
 * API: https://rapidapi.com/tank01/api/nfl-live-in-game-real-time-statistics-nfl
 */

import type { Env, Tank01Player, DefensivePlayer, OffensivePlayer } from '../types';

const TANK01_BASE_URL = 'https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com';

// All NFL teams
const NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS',
];

// Position mappings for Fantasy
const POSITION_MAP: Record<string, string> = {
  // DL (Defensive Line)
  DE: 'DL', DT: 'DL', NT: 'DL',
  // LB (Linebacker)
  LB: 'LB', ILB: 'LB', OLB: 'LB', MLB: 'LB',
  // DB (Defensive Back)
  CB: 'DB', S: 'DB', FS: 'DB', SS: 'DB', DB: 'DB',
};

const DEFENSIVE_POSITIONS = Object.keys(POSITION_MAP);
const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'FB'];

/**
 * Check if Tank01 API is configured
 */
export function isConfigured(env: Env): boolean {
  return Boolean(env.RAPIDAPI_KEY);
}

/**
 * Get headers for Tank01 API requests
 */
function getHeaders(env: Env): HeadersInit {
  return {
    'X-RapidAPI-Key': env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com',
  };
}

/**
 * Safe integer conversion
 */
function safeInt(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  try {
    const num = parseInt(String(value).replace(',', ''), 10);
    return isNaN(num) ? defaultValue : num;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe float conversion
 */
function safeFloat(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  try {
    const num = parseFloat(String(value).replace(',', ''));
    if (isNaN(num) || !isFinite(num)) return defaultValue;
    return num;
  } catch {
    return defaultValue;
  }
}

/**
 * Fetch roster for a single team with stats
 */
async function fetchTeamRoster(team: string, env: Env): Promise<Tank01Player[]> {
  const url = `${TANK01_BASE_URL}/getNFLTeamRoster?teamAbv=${team}&getStats=true`;

  const response = await fetch(url, {
    headers: getHeaders(env),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch roster for ${team}: ${response.status}`);
  }

  const data = await response.json() as { body?: { roster?: Tank01Player[] } };
  return data.body?.roster || [];
}

/**
 * Fetch all players from all teams with stats
 */
async function fetchAllPlayers(env: Env, cache: KVNamespace): Promise<Tank01Player[]> {
  const cacheKey = 'tank01_all_players';

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from all teams in parallel (batched to avoid rate limits)
  const allPlayers: Tank01Player[] = [];
  const batchSize = 8;

  for (let i = 0; i < NFL_TEAMS.length; i += batchSize) {
    const batch = NFL_TEAMS.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(team => fetchTeamRoster(team, env))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPlayers.push(...result.value);
      }
    }
  }

  // Cache for 1 hour
  if (allPlayers.length > 0) {
    await cache.put(cacheKey, JSON.stringify(allPlayers), {
      expirationTtl: 3600,
    });
  }

  return allPlayers;
}

/**
 * Get defensive stats from Tank01 API
 */
export async function getDefensiveStats(
  season: number,
  env: Env,
  cache: KVNamespace
): Promise<DefensivePlayer[]> {
  const cacheKey = `tank01_def_stats_${season}`;

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  if (!isConfigured(env)) {
    throw new Error('Tank01 API not configured. Set RAPIDAPI_KEY secret.');
  }

  // Fetch all players
  const playersRaw = await fetchAllPlayers(env, cache);
  const result: DefensivePlayer[] = [];

  for (const playerData of playersRaw) {
    const pos = String(playerData.pos || '').toUpperCase();

    // Only include defensive positions
    if (!DEFENSIVE_POSITIONS.includes(pos)) {
      continue;
    }

    const fantasyPos = POSITION_MAP[pos] || 'LB';
    const defStats = playerData.stats?.Defense || {};

    const tackles = safeInt(defStats.totalTackles);
    const solo = safeInt(defStats.soloTackles);
    const sacks = safeFloat(defStats.sacks);
    const tfl = safeInt(defStats.tfl);
    const qbHits = safeInt(defStats.qbHits);
    const pd = safeInt(defStats.passDeflections);
    const ints = safeInt(defStats.defensiveInterceptions);
    const ff = safeInt(defStats.forcedFumbles);
    const fr = safeInt(defStats.fumblesRecovered);
    const defTd = safeInt(defStats.defTD);

    // Skip players without relevant stats
    if (tackles === 0 && sacks === 0 && ints === 0) {
      continue;
    }

    result.push({
      id: String(playerData.playerID || playerData.espnID || ''),
      name: playerData.longName || playerData.espnName || 'Unknown',
      team: playerData.team || '',
      teamAbbr: playerData.team || '',
      photoUrl: playerData.espnHeadshot || '',
      espnPosition: pos,
      fantasyPosition: fantasyPos,
      age: playerData.age ? safeInt(playerData.age) : null,
      experience: playerData.exp ? safeInt(playerData.exp) : null,
      jerseyNumber: playerData.jerseyNum ? String(playerData.jerseyNum) : null,
      stats: {
        tackles,
        sacks,
        tfl,
        qbHits,
        passesDefended: pd,
        interceptions: ints,
        forcedFumbles: ff,
        soloTackles: solo,
        assistTackles: tackles > solo ? tackles - solo : 0,
        tacklesWithAssist: 0,
        tflYards: 0,
        sackYards: 0,
        intYards: 0,
        defensiveTds: defTd,
        fumbleRecoveryOwn: 0,
        fumbleRecoveryOpp: fr,
        safeties: 0,
      },
    });
  }

  // Sort by tackles descending
  result.sort((a, b) => b.stats.tackles - a.stats.tackles);

  // Cache for 1 hour
  if (result.length > 0) {
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });
  }

  return result;
}

/**
 * Get offensive stats from Tank01 API
 */
export async function getOffensiveStats(
  season: number,
  env: Env,
  cache: KVNamespace
): Promise<OffensivePlayer[]> {
  const cacheKey = `tank01_off_stats_${season}`;

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  if (!isConfigured(env)) {
    throw new Error('Tank01 API not configured. Set RAPIDAPI_KEY secret.');
  }

  const playersRaw = await fetchAllPlayers(env, cache);
  const result: OffensivePlayer[] = [];

  for (const playerData of playersRaw) {
    const pos = String(playerData.pos || '').toUpperCase();

    // Only include offensive positions
    if (!OFFENSIVE_POSITIONS.includes(pos)) {
      continue;
    }

    const passing = playerData.stats?.Passing || {};
    const rushing = playerData.stats?.Rushing || {};
    const receiving = playerData.stats?.Receiving || {};

    // Passing stats
    const completions = safeInt(passing.passCompletions);
    const attempts = safeInt(passing.passAttempts);
    const passingYards = safeInt(passing.passYds);
    const passingTds = safeInt(passing.passTD);
    const ints = safeInt(passing.int);
    const sacksTaken = safeInt(passing.sacked);

    // Rushing stats
    const carries = safeInt(rushing.carries);
    const rushingYards = safeInt(rushing.rushYds);
    const rushingTds = safeInt(rushing.rushTD);

    // Receiving stats
    const targets = safeInt(receiving.targets);
    const receptions = safeInt(receiving.receptions);
    const receivingYards = safeInt(receiving.recYds);
    const receivingTds = safeInt(receiving.recTD);

    // Calculate passer rating
    let passerRating = 0;
    if (attempts > 0) {
      const a = Math.max(0, Math.min(2.375, ((completions / attempts) - 0.3) * 5));
      const b = Math.max(0, Math.min(2.375, ((passingYards / attempts) - 3) * 0.25));
      const c = Math.max(0, Math.min(2.375, (passingTds / attempts) * 20));
      const d = Math.max(0, Math.min(2.375, 2.375 - ((ints / attempts) * 25)));
      passerRating = Math.round(((a + b + c + d) / 6) * 100 * 10) / 10;
    }

    const totalYards = passingYards + rushingYards + receivingYards;
    if (totalYards === 0) {
      continue;
    }

    result.push({
      id: String(playerData.playerID || playerData.espnID || ''),
      name: playerData.longName || playerData.espnName || 'Unknown',
      team: playerData.team || '',
      teamAbbr: playerData.team || '',
      photoUrl: playerData.espnHeadshot || '',
      position: pos,
      age: playerData.age ? safeInt(playerData.age) : null,
      experience: playerData.exp ? safeInt(playerData.exp) : null,
      jerseyNumber: playerData.jerseyNum ? String(playerData.jerseyNum) : null,
      stats: {
        completions,
        attempts,
        passingYards,
        passingTds,
        interceptions: ints,
        passerRating,
        passingAirYards: 0,
        passingYac: 0,
        passingFirstDowns: 0,
        sacks: sacksTaken,
        sackYards: 0,
        carries,
        rushingYards,
        rushingTds,
        rushingFirstDowns: 0,
        targets,
        receptions,
        receivingYards,
        receivingTds,
        receivingAirYards: 0,
        receivingYac: 0,
        receivingFirstDowns: 0,
        fumbles: 0,
        fumblesLost: 0,
        targetShare: 0,
        airYardsShare: 0,
        wopr: 0,
        racr: 0,
        pacr: 0,
        fantasyPoints: 0,
        fantasyPointsPpr: 0,
      },
    });
  }

  // Sort by total yards descending
  result.sort((a, b) => {
    const aTotal = a.stats.passingYards + a.stats.rushingYards + a.stats.receivingYards;
    const bTotal = b.stats.passingYards + b.stats.rushingYards + b.stats.receivingYards;
    return bTotal - aTotal;
  });

  // Cache for 1 hour
  if (result.length > 0) {
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });
  }

  return result;
}
