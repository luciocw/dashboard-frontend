"""
NFL Stats API
Backend Python com FastAPI para servir stats de NFL
Suporta múltiplas fontes de dados com fallback automático:
- Tank01 (RapidAPI) para dados live
- nflverse para dados históricos

Licença nflverse: CC-BY-SA 4.0 - https://github.com/nflverse/nflverse-data
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from stats import get_defensive_stats, get_offensive_stats, get_available_seasons
from cache import clear_cache, clear_source_cache, sanitize_for_json
from config import PRIMARY_SOURCE
from sources import is_tank01_configured

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
