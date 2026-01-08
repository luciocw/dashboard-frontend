"""
Cache local para dados de NFL stats
Suporta diferentes TTLs para diferentes fontes de dados
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Any

CACHE_DIR = Path(__file__).parent / "cache_data"

# Default TTLs (pode ser sobrescrito via config)
DEFAULT_TTL_SECONDS = 86400  # 24 horas
TTL_TANK01 = 3600           # 1 hora - dados live
TTL_NFLVERSE = 86400        # 24 horas - dados históricos


def get_cache_path(key: str, season: int) -> Path:
    """Retorna o caminho do arquivo de cache"""
    CACHE_DIR.mkdir(exist_ok=True)
    return CACHE_DIR / f"{key}_{season}.json"


def get_cache_metadata_path(key: str, season: int) -> Path:
    """Retorna o caminho do arquivo de metadata do cache"""
    CACHE_DIR.mkdir(exist_ok=True)
    return CACHE_DIR / f"{key}_{season}.meta.json"


def get_ttl_for_key(key: str) -> int:
    """Retorna o TTL apropriado baseado no key do cache"""
    if key.startswith("tank01"):
        return TTL_TANK01
    elif key.startswith("nflverse"):
        return TTL_NFLVERSE
    return DEFAULT_TTL_SECONDS


def is_cache_valid(cache_path: Path, key: str = "") -> bool:
    """
    Verifica se o cache ainda é válido baseado no TTL
    """
    if not cache_path.exists():
        return False

    # Usa TTL baseado no key
    ttl_seconds = get_ttl_for_key(key)

    mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
    return datetime.now() - mtime < timedelta(seconds=ttl_seconds)


def get_cache_age_seconds(cache_path: Path) -> int:
    """Retorna a idade do cache em segundos"""
    if not cache_path.exists():
        return -1

    mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
    age = datetime.now() - mtime
    return int(age.total_seconds())


def read_cache(key: str, season: int) -> Optional[Any]:
    """Lê dados do cache se existir e for válido"""
    cache_path = get_cache_path(key, season)

    if not is_cache_valid(cache_path, key):
        return None

    try:
        with open(cache_path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


def read_cache_with_metadata(key: str, season: int) -> tuple[Optional[Any], dict]:
    """
    Lê dados do cache junto com metadata
    Retorna (data, metadata) onde metadata inclui:
    - cached: bool
    - cache_age_seconds: int
    """
    cache_path = get_cache_path(key, season)
    metadata = {
        "cached": False,
        "cache_age_seconds": 0,
    }

    if not is_cache_valid(cache_path, key):
        return None, metadata

    try:
        with open(cache_path, "r") as f:
            data = json.load(f)

        metadata["cached"] = True
        metadata["cache_age_seconds"] = get_cache_age_seconds(cache_path)

        return data, metadata
    except (json.JSONDecodeError, IOError):
        return None, metadata


def sanitize_for_json(obj: Any) -> Any:
    """Remove valores que não são válidos em JSON (NaN, Infinity)"""
    import math

    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return obj
    return obj


def write_cache(key: str, season: int, data: Any) -> None:
    """Escreve dados no cache, sanitizando valores inválidos para JSON"""
    cache_path = get_cache_path(key, season)

    try:
        # Sanitiza dados para remover NaN/Infinity
        sanitized = sanitize_for_json(data)
        with open(cache_path, "w") as f:
            json.dump(sanitized, f)
    except IOError as e:
        print(f"Erro ao escrever cache: {e}")


def clear_cache(key: Optional[str] = None, season: Optional[int] = None) -> None:
    """Limpa cache específico ou todo o cache"""
    if not CACHE_DIR.exists():
        return

    if key and season is not None:
        cache_path = get_cache_path(key, season)
        if cache_path.exists():
            cache_path.unlink()
    else:
        for file in CACHE_DIR.glob("*.json"):
            file.unlink()


def clear_source_cache(source: str) -> None:
    """Limpa todo o cache de uma fonte específica (tank01 ou nflverse)"""
    if not CACHE_DIR.exists():
        return

    for file in CACHE_DIR.glob(f"{source}_*.json"):
        file.unlink()
