"""
Data sources for NFL Stats API
"""

from .nflverse import (
    get_defensive_stats as get_defensive_stats_nflverse,
    get_offensive_stats as get_offensive_stats_nflverse,
    get_available_seasons as get_available_seasons_nflverse,
)
from .tank01 import (
    get_defensive_stats as get_defensive_stats_tank01,
    get_offensive_stats as get_offensive_stats_tank01,
    is_configured as is_tank01_configured,
)

__all__ = [
    "get_defensive_stats_nflverse",
    "get_offensive_stats_nflverse",
    "get_available_seasons_nflverse",
    "get_defensive_stats_tank01",
    "get_offensive_stats_tank01",
    "is_tank01_configured",
]
