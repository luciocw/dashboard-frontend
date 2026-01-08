"""
Stats Orchestrator - Gerencia fontes de dados com fallback automático

Estratégia:
1. Tenta fonte primária (Tank01 para dados live)
2. Se falhar → fallback para fonte secundária (nflverse para dados históricos)
3. Cache inteligente com TTLs diferentes por fonte

Response inclui metadata:
- source: "tank01" | "nflverse"
- cached: bool
- cache_age_seconds: int
"""

from typing import Optional
from config import PRIMARY_SOURCE, DEBUG
from cache import get_cache_path, get_cache_age_seconds, read_cache_with_metadata
from sources import (
    get_defensive_stats_nflverse,
    get_offensive_stats_nflverse,
    get_available_seasons_nflverse,
    get_defensive_stats_tank01,
    get_offensive_stats_tank01,
    is_tank01_configured,
)


class StatsResult:
    """Resultado com metadata da fonte"""

    def __init__(
        self,
        players: list[dict],
        source: str,
        cached: bool = False,
        cache_age_seconds: int = 0,
        error: Optional[str] = None
    ):
        self.players = players
        self.source = source
        self.cached = cached
        self.cache_age_seconds = cache_age_seconds
        self.error = error

    def to_dict(self) -> dict:
        return {
            "source": self.source,
            "cached": self.cached,
            "cache_age_seconds": self.cache_age_seconds,
            "count": len(self.players),
            "players": self.players,
        }


def get_defensive_stats(season: int = 2024) -> StatsResult:
    """
    Busca stats defensivas com fallback automático

    Ordem de tentativa (baseada em PRIMARY_SOURCE):
    1. tank01 (se configurado) → dados live, TTL 1h
    2. nflverse → dados históricos, TTL 24h
    """
    primary = PRIMARY_SOURCE.lower()

    # Se Tank01 está configurado e é a fonte primária, tenta primeiro
    if primary == "tank01" and is_tank01_configured():
        try:
            if DEBUG:
                print(f"[orchestrator] Tentando Tank01 para defense stats (season={season})")

            players = get_defensive_stats_tank01(season)

            if players:
                # Verifica se veio do cache
                cache_key = f"tank01_def_stats_{season}"
                cache_path = get_cache_path(cache_key, 0)
                age = get_cache_age_seconds(cache_path)
                cached = age >= 0 and age < 3600  # Considera cacheado se age < TTL

                return StatsResult(
                    players=players,
                    source="tank01",
                    cached=cached,
                    cache_age_seconds=max(0, age)
                )

        except Exception as e:
            print(f"[orchestrator] Tank01 falhou: {e}")
            print("[orchestrator] Usando fallback nflverse...")

    # Fallback ou fonte primária: nflverse
    try:
        if DEBUG:
            print(f"[orchestrator] Usando nflverse para defense stats (season={season})")

        players = get_defensive_stats_nflverse(season)

        # Verifica metadata do cache (usa season como key suffix)
        cache_key = "nflverse_player_stats_def"
        cache_path = get_cache_path(cache_key, season)
        age = get_cache_age_seconds(cache_path)
        cached = age >= 0 and age < 86400  # Considera cacheado se age < TTL

        return StatsResult(
            players=players,
            source="nflverse",
            cached=cached,
            cache_age_seconds=max(0, age)
        )

    except Exception as e:
        print(f"[orchestrator] nflverse falhou: {e}")
        return StatsResult(
            players=[],
            source="none",
            error=str(e)
        )


def get_offensive_stats(season: int = 2024) -> StatsResult:
    """
    Busca stats ofensivas com fallback automático
    """
    primary = PRIMARY_SOURCE.lower()

    # Se Tank01 está configurado e é a fonte primária
    if primary == "tank01" and is_tank01_configured():
        try:
            if DEBUG:
                print(f"[orchestrator] Tentando Tank01 para offense stats (season={season})")

            players = get_offensive_stats_tank01(season)

            if players:
                cache_key = f"tank01_off_stats_{season}"
                cache_path = get_cache_path(cache_key, 0)
                age = get_cache_age_seconds(cache_path)
                cached = age >= 0 and age < 3600

                return StatsResult(
                    players=players,
                    source="tank01",
                    cached=cached,
                    cache_age_seconds=max(0, age)
                )

        except Exception as e:
            print(f"[orchestrator] Tank01 falhou: {e}")
            print("[orchestrator] Usando fallback nflverse...")

    # Fallback: nflverse
    try:
        if DEBUG:
            print(f"[orchestrator] Usando nflverse para offense stats (season={season})")

        players = get_offensive_stats_nflverse(season)

        cache_key = "nflverse_player_stats"
        cache_path = get_cache_path(cache_key, season)
        age = get_cache_age_seconds(cache_path)
        cached = age >= 0 and age < 86400

        return StatsResult(
            players=players,
            source="nflverse",
            cached=cached,
            cache_age_seconds=max(0, age)
        )

    except Exception as e:
        print(f"[orchestrator] nflverse falhou: {e}")
        return StatsResult(
            players=[],
            source="none",
            error=str(e)
        )


def get_available_seasons() -> list[int]:
    """
    Retorna lista de temporadas disponíveis
    Usa nflverse como fonte canônica (Tank01 não tem dados históricos)
    """
    return get_available_seasons_nflverse()
