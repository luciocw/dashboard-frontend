# -*- coding: utf-8 -*-
"""
Dynasty Pulse - Value calculation engine for Trade Calculator

Calculates real player values (offense + IDP) using:
- VORP (Value Over Replacement Player)
- Position-based Aging Curves
- Real stats from nflverse/Tank01
- League-specific scoring adjustments (Premium)
- Multi-season data aggregation

Scale: 0-10000 (internal) / 0-100 (UI)
"""

from .vorp import calculate_vorp, REPLACEMENT_LEVEL, SCARCITY_MULTIPLIER
from .aging import calculate_age_factor, AGING_CURVES
from .values import (
    calculate_player_value,
    calculate_all_player_values,
    get_player_value_breakdown,
)
from .scoring_adjust import (
    calculate_scoring_multiplier,
    apply_scoring_adjustment,
    get_league_type_description,
    detect_superflex,
    STANDARD_SCORING,
)
from .multi_season import (
    get_current_season,
    get_default_seasons,
    aggregate_player_stats,
    calculate_trend,
    get_player_trends,
    enhanced_dynasty_window,
    SEASON_WEIGHTS,
)

__all__ = [
    # VORP
    "calculate_vorp",
    "REPLACEMENT_LEVEL",
    "SCARCITY_MULTIPLIER",
    # Aging
    "calculate_age_factor",
    "AGING_CURVES",
    # Values
    "calculate_player_value",
    "calculate_all_player_values",
    "get_player_value_breakdown",
    # Scoring Adjust (Premium)
    "calculate_scoring_multiplier",
    "apply_scoring_adjustment",
    "get_league_type_description",
    "detect_superflex",
    "STANDARD_SCORING",
    # Multi-Season
    "get_current_season",
    "get_default_seasons",
    "aggregate_player_stats",
    "calculate_trend",
    "get_player_trends",
    "enhanced_dynasty_window",
    "SEASON_WEIGHTS",
]

__version__ = "1.2.0"
