"""
Tank01 NFL API data source (RapidAPI)
API: https://rapidapi.com/tank01/api/nfl-live-in-game-real-time-statistics-nfl

Endpoints utilizados:
- /getNFLTeamRoster?teamAbv=XXX&getStats=true - Roster com stats
"""

import httpx
from typing import Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAPIDAPI_KEY, TANK01_BASE_URL, REQUEST_TIMEOUT
from cache import read_cache, write_cache

# Todos os times NFL
NFL_TEAMS = [
    "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE",
    "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC",
    "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG",
    "NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS"
]

# Mapeamento de posições para Fantasy
POSITION_MAP = {
    # DL (Defensive Line)
    "DE": "DL", "DT": "DL", "NT": "DL",
    # LB (Linebacker)
    "LB": "LB", "ILB": "LB", "OLB": "LB", "MLB": "LB",
    # DB (Defensive Back)
    "CB": "DB", "S": "DB", "FS": "DB", "SS": "DB", "DB": "DB",
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
        f = float(str(value).replace(",", ""))
        if f != f or f == float('inf') or f == float('-inf'):  # NaN or Infinity
            return default
        return f
    except (ValueError, TypeError):
        return default


async def fetch_team_roster_with_stats(team: str) -> list[dict]:
    """
    Busca roster de um time com stats
    Endpoint: /getNFLTeamRoster?teamAbv=XXX&getStats=true
    """
    if not is_configured():
        raise ValueError("Tank01 API not configured")

    url = f"{TANK01_BASE_URL}/getNFLTeamRoster"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={"teamAbv": team, "getStats": "true"},
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
        return data.get("body", {}).get("roster", [])


async def fetch_all_players_with_stats() -> list[dict]:
    """
    Busca todos os jogadores de todos os times com stats
    Faz 32 chamadas (1 por time)
    """
    cache_key = "tank01_all_players"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    all_players = []

    for team in NFL_TEAMS:
        try:
            print(f"[tank01] Buscando roster de {team}...")
            roster = await fetch_team_roster_with_stats(team)
            all_players.extend(roster)
        except Exception as e:
            print(f"[tank01] Erro ao buscar {team}: {e}")

    if all_players:
        write_cache(cache_key, 0, all_players)

    return all_players


async def get_defensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats defensivas usando Tank01 API
    """
    cache_key = f"tank01_def_stats_{season}"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured. Set RAPIDAPI_KEY environment variable.")

    # Busca todos os jogadores com stats
    players_raw = await fetch_all_players_with_stats()

    result = []

    for player_data in players_raw:
        pos = str(player_data.get("pos", "")).upper()

        # Só inclui posições defensivas
        if pos not in DEFENSIVE_POSITIONS:
            continue

        fantasy_pos = POSITION_MAP.get(pos, "LB")

        # Extrai stats do objeto - Tank01 usa nested structure
        stats_obj = player_data.get("stats", {}) or {}
        def_stats = stats_obj.get("Defense", {}) or {}

        tackles = safe_int(def_stats.get("totalTackles", 0))
        solo = safe_int(def_stats.get("soloTackles", 0))
        sacks = safe_float(def_stats.get("sacks", 0))
        tfl = safe_int(def_stats.get("tfl", 0))
        qb_hits = safe_int(def_stats.get("qbHits", 0))
        pd = safe_int(def_stats.get("passDeflections", 0))
        ints = safe_int(def_stats.get("defensiveInterceptions", 0))
        ff = safe_int(def_stats.get("forcedFumbles", 0))
        fr = safe_int(def_stats.get("fumblesRecovered", 0))
        def_td = safe_int(def_stats.get("defTD", 0))

        # Só adiciona se tiver stats relevantes
        if tackles == 0 and sacks == 0 and ints == 0:
            continue

        player = {
            "id": str(player_data.get("playerID", player_data.get("espnID", ""))),
            "name": player_data.get("longName") or player_data.get("espnName", "Unknown"),
            "team": player_data.get("team", ""),
            "teamAbbr": player_data.get("team", ""),
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
                "soloTackles": solo,
                "assistTackles": tackles - solo if tackles > solo else 0,
                "tacklesWithAssist": 0,
                "tflYards": 0,
                "sackYards": 0,
                "intYards": 0,
                "defensiveTds": def_td,
                "fumbleRecoveryOwn": 0,
                "fumbleRecoveryOpp": fr,
                "safeties": 0,
            }
        }

        result.append(player)

    # Ordena por tackles (desc)
    result.sort(key=lambda x: x["stats"]["tackles"], reverse=True)

    # Cache o resultado
    if result:
        write_cache(cache_key, 0, result)

    return result


async def get_offensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats ofensivas usando Tank01 API
    """
    cache_key = f"tank01_off_stats_{season}"
    cached = read_cache(cache_key, 0)
    if cached is not None:
        return cached

    if not is_configured():
        raise ValueError("Tank01 API not configured. Set RAPIDAPI_KEY environment variable.")

    # Busca todos os jogadores com stats
    players_raw = await fetch_all_players_with_stats()

    result = []

    for player_data in players_raw:
        pos = str(player_data.get("pos", "")).upper()

        # Só inclui posições ofensivas
        if pos not in OFFENSIVE_POSITIONS:
            continue

        # Extrai stats
        stats_obj = player_data.get("stats", {}) or {}
        passing = stats_obj.get("Passing", {}) or {}
        rushing = stats_obj.get("Rushing", {}) or {}
        receiving = stats_obj.get("Receiving", {}) or {}
        defense = stats_obj.get("Defense", {}) or {}  # Para fumbles

        # Passing stats
        completions = safe_int(passing.get("passCompletions", 0))
        attempts = safe_int(passing.get("passAttempts", 0))
        passing_yards = safe_int(passing.get("passYds", 0))
        passing_tds = safe_int(passing.get("passTD", 0))
        ints = safe_int(passing.get("int", 0))
        sacks_taken = safe_int(passing.get("sacked", 0))

        # Rushing stats
        carries = safe_int(rushing.get("carries", 0))
        rushing_yards = safe_int(rushing.get("rushYds", 0))
        rushing_tds = safe_int(rushing.get("rushTD", 0))

        # Receiving stats
        targets = safe_int(receiving.get("targets", 0))
        receptions = safe_int(receiving.get("receptions", 0))
        receiving_yards = safe_int(receiving.get("recYds", 0))
        receiving_tds = safe_int(receiving.get("recTD", 0))

        # Fumbles
        fumbles = safe_int(defense.get("fumbles", 0))
        fumbles_lost = safe_int(defense.get("fumblesLost", 0))

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
            "teamAbbr": player_data.get("team", ""),
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
                "sacks": sacks_taken,
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
                "fumbles": fumbles,
                "fumblesLost": fumbles_lost,

                # Advanced (not available from Tank01 basic)
                "targetShare": 0,
                "airYardsShare": 0,
                "wopr": 0,
                "racr": 0,
                "pacr": 0,

                # Fantasy (calculated later if needed)
                "fantasyPoints": 0,
                "fantasyPointsPpr": 0,
            }
        }

        result.append(player)

    # Ordena por total yards
    result.sort(key=lambda x: x["stats"]["passingYards"] + x["stats"]["rushingYards"] + x["stats"]["receivingYards"], reverse=True)

    # Cache o resultado
    if result:
        write_cache(cache_key, 0, result)

    return result
