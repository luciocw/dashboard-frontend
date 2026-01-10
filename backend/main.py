"""
NFL Stats API
Backend Python com FastAPI para servir stats de NFL
Suporta múltiplas fontes de dados com fallback automático:
- Tank01 (RapidAPI) para dados live
- nflverse para dados históricos

Licença nflverse: CC-BY-SA 4.0 - https://github.com/nflverse/nflverse-data
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import httpx

from stats import (
    get_defensive_stats,
    get_offensive_stats,
    get_available_seasons,
    get_historical_offensive_stats,
    get_historical_defensive_stats,
)
from cache import clear_cache, clear_source_cache, sanitize_for_json, read_cache, write_cache
from config import PRIMARY_SOURCE
from sources import is_tank01_configured
from dynasty_pulse import calculate_all_player_values, get_player_value_breakdown
from dynasty_pulse.values import get_pick_values, value_to_display
from dynasty_pulse.scoring_adjust import (
    apply_scoring_adjustment,
    get_league_type_description,
    detect_superflex,
)
from dynasty_pulse.multi_season import (
    get_current_season,
    get_default_seasons,
    aggregate_player_stats,
    get_player_trends,
    enhanced_dynasty_window,
    SEASON_WEIGHTS,
)

# Sleeper API base URL
SLEEPER_API = "https://api.sleeper.app/v1"

app = FastAPI(
    title="NFL Stats API",
    description="API para stats de jogadores NFL com fallback automático entre fontes",
    version="2.0.0",
)

# CORS para permitir chamadas do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # CRA dev server
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check e info da API"""
    seasons = get_available_seasons()
    return {
        "status": "ok",
        "message": "NFL Stats API with multi-source fallback",
        "version": "2.0.0",
        "primarySource": PRIMARY_SOURCE,
        "tank01Configured": is_tank01_configured(),
        "attribution": {
            "nflverse": "Data from nflverse (CC-BY-SA 4.0) - https://github.com/nflverse/nflverse-data",
            "tank01": "Data from Tank01 NFL API via RapidAPI",
        },
        "latestSeason": seasons[0] if seasons else 2024,
        "availableSeasons": seasons,
        "endpoints": {
            "defense": "/api/stats/defense",
            "offense": "/api/stats/offense",
            "seasons": "/api/seasons",
        }
    }


@app.get("/api/seasons")
async def available_seasons():
    """Retorna lista de temporadas disponíveis"""
    seasons = get_available_seasons()
    return {
        "seasons": seasons,
        "latest": seasons[0] if seasons else 2024,
    }


@app.get("/api/stats/defense")
async def defense_stats(
    season: int = Query(default=2024, ge=2016, le=2025, description="Temporada NFL")
):
    """
    Retorna stats defensivas de jogadores (tackles, sacks, TFL, INT, FF, PD)

    Response inclui metadata:
    - source: "tank01" | "nflverse" - fonte dos dados
    - cached: bool - se veio do cache
    - cache_age_seconds: int - idade do cache em segundos
    """
    result = await get_defensive_stats(season)

    response = result.to_dict()
    response["season"] = season

    # Adiciona attribution baseado na fonte
    if result.source == "tank01":
        response["attribution"] = "Data from Tank01 NFL API via RapidAPI"
    else:
        response["attribution"] = "Data from nflverse (CC-BY-SA 4.0)"

    # Sanitiza valores inválidos para JSON (NaN, Infinity)
    return sanitize_for_json(response)


@app.get("/api/stats/offense")
async def offense_stats(
    season: int = Query(default=2024, ge=2016, le=2025, description="Temporada NFL")
):
    """
    Retorna stats ofensivas de jogadores (passing, rushing, receiving yards/TDs)

    Response inclui metadata:
    - source: "tank01" | "nflverse" - fonte dos dados
    - cached: bool - se veio do cache
    - cache_age_seconds: int - idade do cache em segundos
    """
    result = await get_offensive_stats(season)

    response = result.to_dict()
    response["season"] = season

    if result.source == "tank01":
        response["attribution"] = "Data from Tank01 NFL API via RapidAPI"
    else:
        response["attribution"] = "Data from nflverse (CC-BY-SA 4.0)"

    # Sanitiza valores inválidos para JSON (NaN, Infinity)
    return sanitize_for_json(response)


@app.post("/api/cache/clear")
async def clear_cache_endpoint(
    key: Optional[str] = Query(default=None, description="Chave específica para limpar"),
    season: Optional[int] = Query(default=None, description="Temporada específica para limpar"),
    source: Optional[str] = Query(default=None, description="Fonte específica (tank01 ou nflverse)"),
):
    """
    Limpa o cache de dados
    Útil para forçar atualização dos dados
    """
    if source:
        clear_source_cache(source)
        return {"status": "ok", "message": f"Cache de {source} limpo com sucesso"}
    else:
        clear_cache(key, season)
        return {"status": "ok", "message": "Cache limpo com sucesso"}


# ============================================
# Dynasty Pulse Endpoints
# ============================================

@app.get("/api/dynasty-pulse/values")
async def get_player_values(
    season: int = Query(default=2024, ge=2016, le=2025, description="Temporada NFL"),
    position: Optional[str] = Query(default=None, description="Filtrar por posição"),
    superflex: bool = Query(default=False, description="Liga Superflex (boost QBs)"),
    tep: bool = Query(default=False, description="Liga TEP (boost TEs)"),
):
    """
    Dynasty Pulse - Valores calculados de todos os jogadores

    Retorna valores 0-10000 (interno) e 0-100 (display) baseados em:
    - VORP (Value Over Replacement Player)
    - Aging Curves por posição
    - Stats reais da temporada

    Parâmetros:
    - season: Temporada para stats (default: 2024)
    - position: Filtrar por posição (QB, RB, WR, TE, K, DL, LB, DB)
    - superflex: Liga Superflex (multiplica valor de QBs)
    - tep: Liga TEP - Tight End Premium (multiplica valor de TEs)
    """
    # Busca stats ofensivas e defensivas
    offense_result = await get_offensive_stats(season)
    defense_result = await get_defensive_stats(season)

    # Calcula valores
    all_values = calculate_all_player_values(
        offensive_players=offense_result.players,
        defensive_players=defense_result.players,
        is_superflex=superflex,
        is_tep=tep,
    )

    # Filtra por posição se especificado
    if position:
        pos_upper = position.upper()
        all_values = {
            pid: val for pid, val in all_values.items()
            if val.get("position") == pos_upper
        }

    # Ordena por valor (maior primeiro)
    sorted_values = sorted(
        all_values.values(),
        key=lambda x: x.get("final_value", 0),
        reverse=True
    )

    return sanitize_for_json({
        "season": season,
        "superflex": superflex,
        "tep": tep,
        "count": len(sorted_values),
        "players": sorted_values,
    })


@app.get("/api/dynasty-pulse/player/{player_id}")
async def get_single_player_value(
    player_id: str,
    season: int = Query(default=2024, ge=2016, le=2025),
    superflex: bool = Query(default=False),
    tep: bool = Query(default=False),
):
    """
    Retorna valor detalhado de um jogador específico com breakdown completo
    """
    # Busca stats
    offense_result = await get_offensive_stats(season)
    defense_result = await get_defensive_stats(season)

    # Procura jogador nas listas
    player = None
    is_defense = False

    for p in offense_result.players:
        if p.get("id") == player_id:
            player = p
            break

    if not player:
        for p in defense_result.players:
            if p.get("id") == player_id:
                player = p
                is_defense = True
                break

    if not player:
        return {"error": "Player not found", "player_id": player_id}

    # Calcula breakdown
    position = player.get("fantasyPosition" if is_defense else "position", "")
    breakdown = get_player_value_breakdown(
        player_id=player_id,
        name=player.get("name", "Unknown"),
        stats=player.get("stats", {}),
        position=position,
        team=player.get("team") or player.get("teamAbbr"),
        age=player.get("age"),
        is_superflex=superflex,
        is_tep=tep,
    )

    return sanitize_for_json({
        "season": season,
        "superflex": superflex,
        "tep": tep,
        "player": breakdown,
    })


@app.get("/api/dynasty-pulse/picks")
async def get_draft_pick_values(
    season: int = Query(default=2026, ge=2025, le=2028, description="Ano do draft"),
):
    """
    Retorna valores de draft picks

    Format: {year}-{round}-{range}
    Range: early (1-4), mid (5-8), late (9-12) para 1st/2nd round
    """
    all_picks = get_pick_values()

    # Filtra pelo ano se especificado
    season_str = str(season)
    filtered = {
        k: {"key": k, "value": v, "display_value": value_to_display(v)}
        for k, v in all_picks.items()
        if k.startswith(season_str)
    }

    return {
        "season": season,
        "count": len(filtered),
        "picks": filtered,
    }


@app.get("/api/dynasty-pulse/health")
async def dynasty_pulse_health():
    """Health check do Dynasty Pulse"""
    return {
        "status": "ok",
        "engine": "Dynasty Pulse",
        "version": "1.2.0",
        "features": {
            "vorp": True,
            "aging_curves": True,
            "idp_support": True,
            "superflex": True,
            "tep": True,
            "scoring_adjust": True,  # Fase 2 - DONE
            "multi_season": True,    # Multi-season aggregation
            "xgboost": False,        # Fase 3
        }
    }


@app.get("/api/dynasty-pulse/values/multi-season")
async def get_multi_season_values(
    num_seasons: int = Query(default=3, ge=1, le=5, description="Number of seasons to aggregate"),
    position: Optional[str] = Query(default=None, description="Filter by position"),
    superflex: bool = Query(default=False, description="Superflex league"),
    tep: bool = Query(default=False, description="TEP league"),
):
    """
    Dynasty Pulse - Multi-season aggregated player values

    Returns player values calculated from aggregated stats across multiple seasons.
    Uses weighted average (recent seasons = higher weight).

    Benefits:
    - More stable values (reduces single-season variance)
    - Better trend detection (rising vs declining players)
    - Enhanced dynasty window (detects early decline)

    Weights:
    - Current season: 50%
    - 1 year ago: 30%
    - 2 years ago: 15%
    - 3+ years ago: 5%

    Parameters:
    - num_seasons: How many seasons to aggregate (1-5, default 3)
    - position: Filter by position
    - superflex: Superflex league boost for QBs
    - tep: TE Premium league boost
    """
    seasons = get_default_seasons(num_seasons)
    current_season = get_current_season()

    # Fetch data for all seasons
    # Use nflverse directly for historical data (Tank01 has issues with historical seasons)
    multi_season_offense: dict = {}
    multi_season_defense: dict = {}

    for season in seasons:
        # Use historical (nflverse) source for accurate per-season data
        offense_result = get_historical_offensive_stats(season)
        defense_result = get_historical_defensive_stats(season)

        # Index by player_id for easy lookup
        multi_season_offense[season] = {
            p.get("id"): p for p in offense_result.players if p.get("id")
        }
        multi_season_defense[season] = {
            p.get("id"): p for p in defense_result.players if p.get("id")
        }

    # Get all unique player IDs across all seasons
    all_player_ids = set()
    for season_data in multi_season_offense.values():
        all_player_ids.update(season_data.keys())
    for season_data in multi_season_defense.values():
        all_player_ids.update(season_data.keys())

    # Calculate values for each player using aggregated stats
    all_values = {}

    for player_id in all_player_ids:
        # Try offense first
        aggregated, per_season = aggregate_player_stats(multi_season_offense, player_id)
        is_defense = False

        if not aggregated:
            # Try defense
            aggregated, per_season = aggregate_player_stats(multi_season_defense, player_id)
            is_defense = True

        if not aggregated:
            continue

        pos = aggregated.get("fantasyPosition" if is_defense else "position", "")
        if not pos or pos not in ["QB", "RB", "WR", "TE", "K", "DL", "LB", "DB"]:
            continue

        # Filter by position if specified
        if position and pos != position.upper():
            continue

        # Calculate value breakdown
        breakdown = get_player_value_breakdown(
            player_id=player_id,
            name=aggregated.get("name", "Unknown"),
            stats=aggregated.get("stats", {}),
            position=pos,
            team=aggregated.get("team") or aggregated.get("teamAbbr"),
            age=aggregated.get("age"),
            is_superflex=superflex,
            is_tep=tep,
        )

        # Add trends and enhanced dynasty window
        trends = get_player_trends(per_season, pos)
        enhanced_window = enhanced_dynasty_window(
            age=aggregated.get("age"),
            position=pos,
            per_season_stats=per_season,
        )

        breakdown["trends"] = trends
        breakdown["dynasty_window"] = enhanced_window
        breakdown["seasons_aggregated"] = aggregated.get("seasons_aggregated", [])
        breakdown["aggregation_weights"] = aggregated.get("aggregation_weights", {})

        all_values[player_id] = breakdown

    # Sort by value
    sorted_values = sorted(
        all_values.values(),
        key=lambda x: x.get("final_value", 0),
        reverse=True
    )

    return sanitize_for_json({
        "seasons": seasons,
        "current_season": current_season,
        "num_seasons": num_seasons,
        "superflex": superflex,
        "tep": tep,
        "weights": SEASON_WEIGHTS,
        "count": len(sorted_values),
        "players": sorted_values,
    })


# ============================================
# Dynasty Pulse Premium Endpoints
# ============================================

async def fetch_league_settings(league_id: str) -> dict:
    """
    Fetches league settings from Sleeper API with caching.
    """
    cache_key = f"sleeper_league_{league_id}"
    cached = read_cache(cache_key, 0)
    if cached:
        return cached

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SLEEPER_API}/league/{league_id}")
            response.raise_for_status()
            data = response.json()
            # Cache for 1 hour
            write_cache(cache_key, 0, data)
            return data
        except httpx.HTTPError as e:
            raise HTTPException(status_code=404, detail=f"League not found: {league_id}")


@app.get("/api/dynasty-pulse/league/{league_id}/values")
async def get_league_adjusted_values(
    league_id: str,
    season: int = Query(default=2024, ge=2016, le=2025, description="NFL Season"),
    position: Optional[str] = Query(default=None, description="Filter by position"),
):
    """
    Dynasty Pulse Premium - League-adjusted player values

    Returns values adjusted for the specific league's scoring settings.
    This is a PREMIUM feature that provides personalized values.

    The endpoint:
    1. Fetches league settings from Sleeper API
    2. Detects league type (Superflex, TEP, IDP settings)
    3. Calculates base values using VORP + Aging
    4. Applies scoring multipliers based on league settings
    5. Returns adjusted values with breakdown

    Parameters:
    - league_id: Sleeper league ID
    - season: NFL season for stats (default: 2024)
    - position: Filter by position (QB, RB, WR, TE, K, DL, LB, DB)
    """
    # Fetch league settings from Sleeper
    league_data = await fetch_league_settings(league_id)

    scoring_settings = league_data.get("scoring_settings", {})
    roster_positions = league_data.get("roster_positions", [])
    league_name = league_data.get("name", "Unknown League")

    # Detect league type
    is_superflex = detect_superflex(scoring_settings, roster_positions)
    is_tep = scoring_settings.get("bonus_rec_te", 0) > 0
    league_type = get_league_type_description(scoring_settings)

    # Fetch stats
    offense_result = await get_offensive_stats(season)
    defense_result = await get_defensive_stats(season)

    # Calculate base values
    base_values = calculate_all_player_values(
        offensive_players=offense_result.players,
        defensive_players=defense_result.players,
        is_superflex=is_superflex,
        is_tep=is_tep,
    )

    # Apply scoring adjustments
    adjusted_values = {}
    for player_id, player_data in base_values.items():
        base_value = player_data.get("final_value", 0)
        pos = player_data.get("position", "")

        # Apply scoring adjustment
        adjusted_value, multiplier, breakdown = apply_scoring_adjustment(
            base_value=base_value,
            scoring_settings=scoring_settings,
            position=pos,
        )

        # Create adjusted player data
        adjusted_player = dict(player_data)
        adjusted_player["base_value"] = base_value
        adjusted_player["final_value"] = adjusted_value
        adjusted_player["display_value"] = round(adjusted_value / 100, 1)
        adjusted_player["scoring_multiplier"] = round(multiplier, 3)
        adjusted_player["scoring_adjustments"] = breakdown

        adjusted_values[player_id] = adjusted_player

    # Filter by position if specified
    if position:
        pos_upper = position.upper()
        adjusted_values = {
            pid: val for pid, val in adjusted_values.items()
            if val.get("position") == pos_upper
        }

    # Sort by adjusted value
    sorted_values = sorted(
        adjusted_values.values(),
        key=lambda x: x.get("final_value", 0),
        reverse=True
    )

    return sanitize_for_json({
        "league_id": league_id,
        "league_name": league_name,
        "league_type": league_type,
        "is_superflex": is_superflex,
        "is_tep": is_tep,
        "season": season,
        "count": len(sorted_values),
        "players": sorted_values,
    })


@app.get("/api/dynasty-pulse/league/{league_id}/player/{player_id}")
async def get_league_adjusted_player(
    league_id: str,
    player_id: str,
    season: int = Query(default=2024, ge=2016, le=2025),
):
    """
    Returns detailed breakdown for a single player with league-specific adjustments.
    """
    # Fetch league settings
    league_data = await fetch_league_settings(league_id)
    scoring_settings = league_data.get("scoring_settings", {})
    roster_positions = league_data.get("roster_positions", [])

    is_superflex = detect_superflex(scoring_settings, roster_positions)
    is_tep = scoring_settings.get("bonus_rec_te", 0) > 0
    league_type = get_league_type_description(scoring_settings)

    # Fetch stats
    offense_result = await get_offensive_stats(season)
    defense_result = await get_defensive_stats(season)

    # Find player
    player = None
    is_defense = False

    for p in offense_result.players:
        if p.get("id") == player_id:
            player = p
            break

    if not player:
        for p in defense_result.players:
            if p.get("id") == player_id:
                player = p
                is_defense = True
                break

    if not player:
        raise HTTPException(status_code=404, detail=f"Player not found: {player_id}")

    # Calculate base breakdown
    position = player.get("fantasyPosition" if is_defense else "position", "")
    breakdown = get_player_value_breakdown(
        player_id=player_id,
        name=player.get("name", "Unknown"),
        stats=player.get("stats", {}),
        position=position,
        team=player.get("team") or player.get("teamAbbr"),
        age=player.get("age"),
        is_superflex=is_superflex,
        is_tep=is_tep,
    )

    # Apply scoring adjustment
    base_value = breakdown.get("final_value", 0)
    adjusted_value, multiplier, scoring_breakdown = apply_scoring_adjustment(
        base_value=base_value,
        scoring_settings=scoring_settings,
        position=position,
    )

    # Add adjustment info to breakdown
    breakdown["base_value"] = base_value
    breakdown["final_value"] = adjusted_value
    breakdown["display_value"] = round(adjusted_value / 100, 1)
    breakdown["scoring_multiplier"] = round(multiplier, 3)
    breakdown["scoring_adjustments"] = scoring_breakdown

    return sanitize_for_json({
        "league_id": league_id,
        "league_type": league_type,
        "is_superflex": is_superflex,
        "is_tep": is_tep,
        "season": season,
        "player": breakdown,
    })


@app.get("/api/dynasty-pulse/league/{league_id}/info")
async def get_league_info(league_id: str):
    """
    Returns league info and detected settings.
    Useful for showing users what adjustments will be applied.
    """
    league_data = await fetch_league_settings(league_id)

    scoring_settings = league_data.get("scoring_settings", {})
    roster_positions = league_data.get("roster_positions", [])

    is_superflex = detect_superflex(scoring_settings, roster_positions)
    is_tep = scoring_settings.get("bonus_rec_te", 0) > 0
    league_type = get_league_type_description(scoring_settings)

    # Extract key scoring settings for display
    key_settings = {
        "rec": scoring_settings.get("rec", 1.0),
        "bonus_rec_te": scoring_settings.get("bonus_rec_te", 0),
        "pass_td": scoring_settings.get("pass_td", 4.0),
        "idp_tkl_solo": scoring_settings.get("idp_tkl_solo", 1.0),
        "idp_sack": scoring_settings.get("idp_sack", 2.0),
        "idp_int": scoring_settings.get("idp_int", 3.0),
    }

    return {
        "league_id": league_id,
        "name": league_data.get("name", "Unknown"),
        "league_type": league_type,
        "is_superflex": is_superflex,
        "is_tep": is_tep,
        "roster_positions": roster_positions,
        "key_scoring_settings": key_settings,
        "total_rosters": league_data.get("total_rosters", 12),
        "status": league_data.get("status", "unknown"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
