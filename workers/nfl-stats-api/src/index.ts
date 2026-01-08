/**
 * NFL Stats API - Cloudflare Worker
 *
 * Provides NFL player statistics with caching via Cloudflare KV.
 * Primary data source: Tank01 API (RapidAPI)
 */

import type { Env, StatsResponse, DefensivePlayer, OffensivePlayer } from './types';
import { getDefensiveStats, getOffensiveStats, isConfigured } from './sources/tank01';

// CORS headers for frontend access
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Create error response
 */
function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message, status }, status);
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET / - Health check and API info
 */
async function handleRoot(env: Env): Promise<Response> {
  const seasons = [2024, 2023, 2022, 2021, 2020];

  return jsonResponse({
    status: 'ok',
    message: 'NFL Stats API - Cloudflare Worker',
    version: '1.0.0',
    primarySource: env.PRIMARY_SOURCE || 'tank01',
    tank01Configured: isConfigured(env),
    attribution: {
      tank01: 'Data from Tank01 NFL API via RapidAPI',
    },
    latestSeason: seasons[0],
    availableSeasons: seasons,
    endpoints: {
      defense: '/api/stats/defense',
      offense: '/api/stats/offense',
      seasons: '/api/seasons',
    },
  });
}

/**
 * GET /api/seasons - Available seasons
 */
function handleSeasons(): Response {
  const seasons = [2024, 2023, 2022, 2021, 2020];

  return jsonResponse({
    seasons,
    latest: seasons[0],
  });
}

/**
 * GET /api/stats/defense - Defensive player stats
 */
async function handleDefenseStats(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const seasonParam = url.searchParams.get('season');
  const season = seasonParam ? parseInt(seasonParam, 10) : 2024;

  // Validate season
  if (isNaN(season) || season < 2016 || season > 2025) {
    return errorResponse('Invalid season. Must be between 2016 and 2025.', 400);
  }

  try {
    // Check cache first
    const cacheKey = `defense_stats_${season}`;
    const cached = await env.CACHE.get(cacheKey);

    let players: DefensivePlayer[];
    let fromCache = false;
    let cacheAge = 0;

    if (cached) {
      players = JSON.parse(cached);
      fromCache = true;

      // Get cache metadata for age
      const metadata = await env.CACHE.getWithMetadata(cacheKey);
      if (metadata.metadata && typeof metadata.metadata === 'object') {
        const meta = metadata.metadata as { timestamp?: number };
        if (meta.timestamp) {
          cacheAge = Math.floor((Date.now() - meta.timestamp) / 1000);
        }
      }
    } else {
      players = await getDefensiveStats(season, env, env.CACHE);

      // Cache with metadata
      await env.CACHE.put(cacheKey, JSON.stringify(players), {
        expirationTtl: parseInt(env.CACHE_TTL_TANK01 || '3600', 10),
        metadata: { timestamp: Date.now() },
      });
    }

    const response: StatsResponse<DefensivePlayer> = {
      source: 'tank01',
      cached: fromCache,
      cache_age_seconds: cacheAge,
      count: players.length,
      players,
      season,
      attribution: 'Data from Tank01 NFL API via RapidAPI',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Error fetching defense stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(`Failed to fetch defensive stats: ${message}`, 500);
  }
}

/**
 * GET /api/stats/offense - Offensive player stats
 */
async function handleOffenseStats(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const seasonParam = url.searchParams.get('season');
  const season = seasonParam ? parseInt(seasonParam, 10) : 2024;

  // Validate season
  if (isNaN(season) || season < 2016 || season > 2025) {
    return errorResponse('Invalid season. Must be between 2016 and 2025.', 400);
  }

  try {
    // Check cache first
    const cacheKey = `offense_stats_${season}`;
    const cached = await env.CACHE.get(cacheKey);

    let players: OffensivePlayer[];
    let fromCache = false;
    let cacheAge = 0;

    if (cached) {
      players = JSON.parse(cached);
      fromCache = true;

      const metadata = await env.CACHE.getWithMetadata(cacheKey);
      if (metadata.metadata && typeof metadata.metadata === 'object') {
        const meta = metadata.metadata as { timestamp?: number };
        if (meta.timestamp) {
          cacheAge = Math.floor((Date.now() - meta.timestamp) / 1000);
        }
      }
    } else {
      players = await getOffensiveStats(season, env, env.CACHE);

      await env.CACHE.put(cacheKey, JSON.stringify(players), {
        expirationTtl: parseInt(env.CACHE_TTL_TANK01 || '3600', 10),
        metadata: { timestamp: Date.now() },
      });
    }

    const response: StatsResponse<OffensivePlayer> = {
      source: 'tank01',
      cached: fromCache,
      cache_age_seconds: cacheAge,
      count: players.length,
      players,
      season,
      attribution: 'Data from Tank01 NFL API via RapidAPI',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Error fetching offense stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(`Failed to fetch offensive stats: ${message}`, 500);
  }
}

/**
 * POST /api/cache/clear - Clear cache
 */
async function handleClearCache(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const season = url.searchParams.get('season');
  const source = url.searchParams.get('source');

  try {
    // List all keys and delete matching ones
    const list = await env.CACHE.list();

    let deleted = 0;
    for (const key of list.keys) {
      let shouldDelete = true;

      if (season && !key.name.includes(`_${season}`)) {
        shouldDelete = false;
      }
      if (source && !key.name.startsWith(source)) {
        shouldDelete = false;
      }

      if (shouldDelete) {
        await env.CACHE.delete(key.name);
        deleted++;
      }
    }

    return jsonResponse({
      status: 'ok',
      message: `Cache cleared successfully. Deleted ${deleted} entries.`,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return errorResponse('Failed to clear cache', 500);
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests
      if (path === '/' || path === '') {
        return handleRoot(env);
      }

      if (path === '/api/seasons') {
        return handleSeasons();
      }

      if (path === '/api/stats/defense') {
        return handleDefenseStats(request, env);
      }

      if (path === '/api/stats/offense') {
        return handleOffenseStats(request, env);
      }

      if (path === '/api/cache/clear' && request.method === 'POST') {
        return handleClearCache(request, env);
      }

      // 404 for unknown routes
      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Unhandled error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(`Internal server error: ${message}`, 500);
    }
  },
};
