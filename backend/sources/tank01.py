"""
Tank01 NFL API data source (RapidAPI)
API: https://rapidapi.com/tank01/api/nfl-live-in-game-real-time-statistics-nfl

Endpoints utilizados:
- /getNFLPlayerList - Lista de jogadores com stats
- /getNFLTeamRoster - Roster de um time
- /getNFLGamesForPlayer - Jogos de um jogador específico
"""

import httpx
from typing import Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAPIDAPI_KEY, TANK01_BASE_URL, REQUEST_TIMEOUT
from cache import read_cache, write_cache

# Mapeamento de posições para Fantasy
POSITION_MAP = {
    # DL (Defensive Line)
    "DE": "DL",
    "DT": "DL",
    "NT": "DL",
    # LB (Linebacker)
    "LB": "LB",
    "ILB": "LB",
    "OLB": "LB",
    "MLB": "LB",
    # DB (Defensive Back)
    "CB": "DB",
    "S": "DB",
    "FS": "DB",
    "SS": "DB",
    "DB": "DB",
}

DEFENSIVE_POSITIONS = list(POSITION_MAP.keys())
OFFENSIVE_POSITIONS = ["QB", "RB", "WR", "TE", "FB"]


def is_configured() -> bool:
    """Verifica se a API está configurada"""
    return bool(RAPIDAPI_KEY)


def get_headers() -> dict:
    """Retorna headers para requisições à API"""
    return {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
    }


def safe_int(value, default=0) -> int:
    """Converte valor para int de forma segura"""
    if value is None:
        return default
    try:
        return int(float(str(value).replace(",", "")))
    except (ValueError, TypeError):
        return default


def safe_float(value, default=0.0) -> float:
    """Converte valor para float de forma segura"""
    if value is None:
        return default
    try:
        return float(str(value).replace(",", ""))
    except (ValueError, TypeError):
        return default


async def fetch_player_list() -> list[dict]:
    """
    Busca lista de todos os jogadores da NFL
    Endpoint: /getNFLPlayerList
    """
    cache_key = "tank01_player_list"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured. Set RAPIDAPI_KEY environment variable.")

    url = f"{TANK01_BASE_URL}/getNFLPlayerList"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()

        # API retorna { body: [...players] }
        players = data.get("body", [])

        write_cache(cache_key, 0, players)
        return players


async def fetch_team_roster(team: str) -> list[dict]:
    """
    Busca roster de um time específico
    Endpoint: /getNFLTeamRoster
    """
    cache_key = f"tank01_roster_{team}"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured")

    url = f"{TANK01_BASE_URL}/getNFLTeamRoster"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={"teamAbv": team},
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()

        roster = data.get("body", {}).get("roster", [])

        write_cache(cache_key, 0, roster)
        return roster


def get_defensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats defensivas usando Tank01 API (síncrono wrapper)
    Note: Tank01 não tem endpoint sazonal, então usamos dados atuais
    """
    import asyncio

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    try:
        return loop.run_until_complete(_get_defensive_stats_async(season))
    except Exception as e:
        print(f"[tank01] Error fetching defensive stats: {e}")
        raise


async def _get_defensive_stats_async(season: int = 2024) -> list[dict]:
    """
    Busca stats defensivas de todos os jogadores
    """
    cache_key = f"tank01_def_stats_{season}"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured. Set RAPIDAPI_KEY environment variable.")

    # Busca lista de jogadores
    players_raw = await fetch_player_list()

    result = []

    for player_data in players_raw:
        pos = str(player_data.get("pos", "")).upper()

        # Só inclui posições defensivas
        if pos not in DEFENSIVE_POSITIONS:
            continue

        fantasy_pos = POSITION_MAP.get(pos, "LB")

        # Extrai stats do objeto
        # Tank01 retorna stats no formato: { "Tackles": "50", "Sacks": "5.0", ... }
        stats_raw = player_data.get("stats", {}) or {}

        tackles = safe_int(stats_raw.get("tackles") or stats_raw.get("Tackles") or
                          stats_raw.get("totalTackles") or player_data.get("tackles", 0))
        sacks = safe_float(stats_raw.get("sacks") or stats_raw.get("Sacks") or
                          player_data.get("sacks", 0))
        tfl = safe_int(stats_raw.get("tfl") or stats_raw.get("TFL") or
                      stats_raw.get("tacklesForLoss") or player_data.get("tfl", 0))
        qb_hits = safe_int(stats_raw.get("qbHits") or stats_raw.get("QB Hits") or
                          player_data.get("qbHits", 0))
        pd = safe_int(stats_raw.get("passDeflections") or stats_raw.get("Pass Deflections") or
                     stats_raw.get("pd") or player_data.get("passDeflections", 0))
        ints = safe_int(stats_raw.get("interceptions") or stats_raw.get("Int") or
                       player_data.get("interceptions", 0))
        ff = safe_int(stats_raw.get("forcedFumbles") or stats_raw.get("Forced Fumbles") or
                     player_data.get("forcedFumbles", 0))

        # Só adiciona se tiver stats relevantes
        if tackles == 0 and sacks == 0 and ints == 0:
            continue

        player = {
            "id": str(player_data.get("playerID", player_data.get("espnID", ""))),
            "name": player_data.get("longName") or player_data.get("espnName", "Unknown"),
            "team": player_data.get("team", ""),
            "teamAbbr": player_data.get("teamAbv", player_data.get("team", "")),
            "photoUrl": player_data.get("espnHeadshot", ""),
            "espnPosition": pos,
            "fantasyPosition": fantasy_pos,
            "age": safe_int(player_data.get("age")) if player_data.get("age") else None,
            "experience": safe_int(player_data.get("exp")) if player_data.get("exp") else None,
            "jerseyNumber": str(player_data.get("jerseyNum", "")) if player_data.get("jerseyNum") else None,
            "stats": {
                "tackles": tackles,
                "sacks": sacks,
                "tfl": tfl,
                "qbHits": qb_hits,
                "passesDefended": pd,
                "interceptions": ints,
                "forcedFumbles": ff,
                # Stats adicionais (zeros se não disponíveis)
                "soloTackles": safe_int(stats_raw.get("soloTackles", 0)),
                "assistTackles": safe_int(stats_raw.get("assistTackles", 0)),
                "tacklesWithAssist": 0,
                "tflYards": 0,
                "sackYards": safe_float(stats_raw.get("sackYards", 0)),
                "intYards": safe_int(stats_raw.get("intYards", 0)),
                "defensiveTds": safe_int(stats_raw.get("defTD", 0)),
                "fumbleRecoveryOwn": 0,
                "fumbleRecoveryOpp": safe_int(stats_raw.get("fumbleRecoveries", 0)),
                "safeties": safe_int(stats_raw.get("safeties", 0)),
            }
        }

        result.append(player)

    # Ordena por tackles (desc)
    result.sort(key=lambda x: x["stats"]["tackles"], reverse=True)

    # Cache o resultado
    write_cache(cache_key, 0, result)

    return result


def get_offensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats ofensivas usando Tank01 API (síncrono wrapper)
    """
    import asyncio

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    try:
        return loop.run_until_complete(_get_offensive_stats_async(season))
    except Exception as e:
        print(f"[tank01] Error fetching offensive stats: {e}")
        raise


async def _get_offensive_stats_async(season: int = 2024) -> list[dict]:
    """
    Busca stats ofensivas de todos os jogadores
    """
    cache_key = f"tank01_off_stats_{season}"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured. Set RAPIDAPI_KEY environment variable.")

    # Busca lista de jogadores
    players_raw = await fetch_player_list()

    result = []

    for player_data in players_raw:
        pos = str(player_data.get("pos", "")).upper()

        # Só inclui posições ofensivas
        if pos not in OFFENSIVE_POSITIONS:
            continue

        # Extrai stats
        stats_raw = player_data.get("stats", {}) or {}

        # Passing
        completions = safe_int(stats_raw.get("passCompletions", 0))
        attempts = safe_int(stats_raw.get("passAttempts", 0))
        passing_yards = safe_int(stats_raw.get("passYds") or stats_raw.get("passingYards", 0))
        passing_tds = safe_int(stats_raw.get("passTD") or stats_raw.get("passingTouchdowns", 0))
        ints = safe_int(stats_raw.get("int") or stats_raw.get("interceptions", 0))

        # Rushing
        carries = safe_int(stats_raw.get("carries") or stats_raw.get("rushAttempts", 0))
        rushing_yards = safe_int(stats_raw.get("rushYds") or stats_raw.get("rushingYards", 0))
        rushing_tds = safe_int(stats_raw.get("rushTD") or stats_raw.get("rushingTouchdowns", 0))

        # Receiving
        targets = safe_int(stats_raw.get("targets", 0))
        receptions = safe_int(stats_raw.get("receptions") or stats_raw.get("rec", 0))
        receiving_yards = safe_int(stats_raw.get("recYds") or stats_raw.get("receivingYards", 0))
        receiving_tds = safe_int(stats_raw.get("recTD") or stats_raw.get("receivingTouchdowns", 0))

        # Calcula passer rating
        passer_rating = 0.0
        if attempts > 0:
            a = max(0, min(2.375, ((completions / attempts) - 0.3) * 5))
            b = max(0, min(2.375, ((passing_yards / attempts) - 3) * 0.25))
            c = max(0, min(2.375, (passing_tds / attempts) * 20))
            d = max(0, min(2.375, 2.375 - ((ints / attempts) * 25)))
            passer_rating = round(((a + b + c + d) / 6) * 100, 1)

        total_yards = passing_yards + rushing_yards + receiving_yards
        if total_yards == 0:
            continue

        player = {
            "id": str(player_data.get("playerID", player_data.get("espnID", ""))),
            "name": player_data.get("longName") or player_data.get("espnName", "Unknown"),
            "team": player_data.get("team", ""),
            "teamAbbr": player_data.get("teamAbv", player_data.get("team", "")),
            "photoUrl": player_data.get("espnHeadshot", ""),
            "position": pos,
            "age": safe_int(player_data.get("age")) if player_data.get("age") else None,
            "experience": safe_int(player_data.get("exp")) if player_data.get("exp") else None,
            "jerseyNumber": str(player_data.get("jerseyNum", "")) if player_data.get("jerseyNum") else None,
            "stats": {
                # Passing
                "completions": completions,
                "attempts": attempts,
                "passingYards": passing_yards,
                "passingTds": passing_tds,
                "interceptions": ints,
                "passerRating": passer_rating,
                "passingAirYards": 0,
                "passingYac": 0,
                "passingFirstDowns": 0,
                "sacks": safe_int(stats_raw.get("sacked", 0)),
                "sackYards": 0,

                # Rushing
                "carries": carries,
                "rushingYards": rushing_yards,
                "rushingTds": rushing_tds,
                "rushingFirstDowns": 0,

                # Receiving
                "targets": targets,
                "receptions": receptions,
                "receivingYards": receiving_yards,
                "receivingTds": receiving_tds,
                "receivingAirYards": 0,
                "receivingYac": 0,
                "receivingFirstDowns": 0,

                # Fumbles
                "fumbles": safe_int(stats_raw.get("fumbles", 0)),
                "fumblesLost": safe_int(stats_raw.get("fumblesLost", 0)),

                # Advanced (not available from Tank01)
                "targetShare": 0,
                "airYardsShare": 0,
                "wopr": 0,
                "racr": 0,
                "pacr": 0,

                # Fantasy
                "fantasyPoints": safe_float(stats_raw.get("fantasyPoints", 0)),
                "fantasyPointsPpr": safe_float(stats_raw.get("fantasyPointsPPR", 0)),
            }
        }

        result.append(player)

    # Ordena por fantasy points PPR
    result.sort(key=lambda x: x["stats"].get("fantasyPointsPpr", 0), reverse=True)

    # Cache o resultado
    write_cache(cache_key, 0, result)

    return result
