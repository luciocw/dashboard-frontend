# -*- coding: utf-8 -*-
"""
Multi-Season Data Handler

Handles fetching and aggregating player data across multiple seasons.
This is essential for:
- Dynasty Window analysis (trends over time)
- More stable VORP calculations (reduces single-season variance)
- XGBoost training (Phase 3) - needs historical data

Default: Last 3 seasons with weighted average (recent = more weight)
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime

# Current season detection
def get_current_season() -> int:
    """
    Returns the current NFL season year.
    NFL season starts in September, so Aug or before = previous year.
    """
    now = datetime.now()
    year = now.year
    # If before September, we're still in previous season's data period
    if now.month < 9:
        return year - 1
    return year


# Default seasons to fetch
def get_default_seasons(num_years: int = 3) -> List[int]:
    """
    Returns list of seasons to fetch.
    Default: last 3 completed seasons + current if available.

    Example (if current is 2024):
    - 2024 (current/latest)
    - 2023
    - 2022
    """
    current = get_current_season()
    # Include current + previous years
    return list(range(current, current - num_years, -1))


# Season weights (more recent = higher weight)
SEASON_WEIGHTS: Dict[int, float] = {
    0: 0.50,  # Current season (50%)
    1: 0.30,  # 1 year ago (30%)
    2: 0.15,  # 2 years ago (15%)
    3: 0.05,  # 3 years ago (5%)
}


def calculate_weight(years_ago: int) -> float:
    """
    Returns weight for a season based on how many years ago it was.
    More recent seasons have higher weight.
    """
    return SEASON_WEIGHTS.get(years_ago, 0.05)


def aggregate_player_stats(
    multi_season_data: Dict[int, Dict[str, dict]],
    player_id: str,
) -> Tuple[Optional[dict], Dict[int, dict]]:
    """
    Aggregates player stats across multiple seasons using weighted average.

    Args:
        multi_season_data: Dict mapping season -> player_id -> player_data
        player_id: Player ID to aggregate

    Returns:
        Tuple of:
        - Aggregated stats dict (or None if player not found)
        - Dict of season -> raw stats for that season
    """
    current_season = get_current_season()
    seasons_found = []
    per_season_stats: Dict[int, dict] = {}

    # Collect player data from each season
    for season, players in multi_season_data.items():
        if player_id in players:
            player = players[player_id]
            seasons_found.append(season)
            per_season_stats[season] = player.get("stats", {})

    if not seasons_found:
        return None, {}

    # If only one season, return those stats directly
    if len(seasons_found) == 1:
        season = seasons_found[0]
        return multi_season_data[season][player_id], per_season_stats

    # Get the most recent season's player data as base
    latest_season = max(seasons_found)
    base_player = dict(multi_season_data[latest_season][player_id])

    # Aggregate stats using weighted average
    aggregated_stats = {}
    total_weight = 0.0

    # Offensive stats to aggregate (keys match Tank01/nflverse API)
    offensive_stats = [
        # Passing
        "passingYards", "passingTds", "interceptions", "attempts", "completions",
        # Rushing
        "rushingYards", "rushingTds", "carries",
        # Receiving
        "receivingYards", "receivingTds", "receptions", "targets",
        # Other
        "games", "fumblesLost", "fantasyPointsPpr",
    ]

    # Defensive stats to aggregate
    defensive_stats = [
        "tackles", "soloTackles", "assistTackles", "tfl",
        "sacks", "interceptions", "passesDefended", "forcedFumbles",
        "fumbleRecoveryOpp", "fumbleRecoveryOwn", "defensiveTds",
        "qbHits", "games",
    ]

    all_stats = offensive_stats + defensive_stats

    for season in seasons_found:
        years_ago = current_season - season
        weight = calculate_weight(years_ago)
        total_weight += weight

        stats = per_season_stats.get(season, {})
        for stat_key in all_stats:
            if stat_key in stats and stats[stat_key] is not None:
                if stat_key not in aggregated_stats:
                    aggregated_stats[stat_key] = 0.0
                aggregated_stats[stat_key] += stats[stat_key] * weight

    # Normalize by total weight
    if total_weight > 0:
        for stat_key in aggregated_stats:
            aggregated_stats[stat_key] = round(aggregated_stats[stat_key] / total_weight, 2)

    base_player["stats"] = aggregated_stats
    base_player["seasons_aggregated"] = sorted(seasons_found, reverse=True)
    base_player["aggregation_weights"] = {
        season: calculate_weight(current_season - season)
        for season in seasons_found
    }

    return base_player, per_season_stats


def calculate_trend(
    per_season_stats: Dict[int, dict],
    stat_key: str,
) -> Dict[str, float]:
    """
    Calculates trend for a specific stat across seasons.

    Returns:
        Dict with:
        - direction: "up", "down", or "stable"
        - magnitude: percentage change per year
        - consistency: how stable the trend is (0-1)
    """
    if len(per_season_stats) < 2:
        return {"direction": "stable", "magnitude": 0.0, "consistency": 1.0}

    # Sort seasons
    sorted_seasons = sorted(per_season_stats.keys(), reverse=True)
    values = []

    for season in sorted_seasons:
        stats = per_season_stats[season]
        value = stats.get(stat_key, 0)
        if value is not None:
            values.append(value)

    if len(values) < 2:
        return {"direction": "stable", "magnitude": 0.0, "consistency": 1.0}

    # Calculate year-over-year changes
    changes = []
    for i in range(len(values) - 1):
        if values[i + 1] != 0:
            pct_change = (values[i] - values[i + 1]) / values[i + 1]
            changes.append(pct_change)

    if not changes:
        return {"direction": "stable", "magnitude": 0.0, "consistency": 1.0}

    avg_change = sum(changes) / len(changes)

    # Determine direction
    if avg_change > 0.05:
        direction = "up"
    elif avg_change < -0.05:
        direction = "down"
    else:
        direction = "stable"

    # Calculate consistency (all changes in same direction = 1.0)
    if len(changes) > 1:
        same_direction = sum(1 for c in changes if (c > 0) == (avg_change > 0))
        consistency = same_direction / len(changes)
    else:
        consistency = 1.0

    return {
        "direction": direction,
        "magnitude": round(avg_change * 100, 1),  # As percentage
        "consistency": round(consistency, 2),
    }


def get_player_trends(
    per_season_stats: Dict[int, dict],
    position: str,
) -> Dict[str, Dict[str, float]]:
    """
    Calculates trends for key stats based on position.

    Returns dict mapping stat_key -> trend info
    """
    pos = position.upper()

    # Key stats by position (keys match API)
    if pos == "QB":
        key_stats = ["passingYards", "passingTds", "interceptions"]
    elif pos == "RB":
        key_stats = ["rushingYards", "rushingTds", "receptions"]
    elif pos in ["WR", "TE"]:
        key_stats = ["receivingYards", "receivingTds", "receptions"]
    elif pos in ["DL", "LB", "DB"]:
        key_stats = ["soloTackles", "sacks", "interceptions"]
    else:
        key_stats = []

    trends = {}
    for stat in key_stats:
        trends[stat] = calculate_trend(per_season_stats, stat)

    return trends


# Dynasty Window enhancement with multi-season data
def enhanced_dynasty_window(
    age: Optional[int],
    position: str,
    per_season_stats: Dict[int, dict],
) -> Dict:
    """
    Enhanced dynasty window calculation using multi-season trends.

    Improves on single-season calculation by detecting:
    - Players declining faster than expected (injury risk, etc.)
    - Players still improving (late bloomers)
    - Stable performers
    """
    from .aging import get_dynasty_window

    # Base dynasty window from aging curves
    base_window = get_dynasty_window(age, position)

    # Get performance trends
    trends = get_player_trends(per_season_stats, position)

    # Adjust recommendation based on trends
    adjustment_factor = 1.0
    trend_notes = []

    for stat, trend in trends.items():
        if trend["direction"] == "up" and trend["consistency"] > 0.6:
            adjustment_factor *= 1.1  # Still improving
            trend_notes.append(f"{stat}: +{trend['magnitude']}%/yr")
        elif trend["direction"] == "down" and trend["consistency"] > 0.6:
            adjustment_factor *= 0.9  # Declining
            trend_notes.append(f"{stat}: {trend['magnitude']}%/yr")

    # Adjust peak_years_left based on trend
    adjusted_peak = base_window.get("peak_years_left", 0)
    if adjustment_factor < 0.9:
        adjusted_peak = max(0, adjusted_peak - 1)  # Declining faster
    elif adjustment_factor > 1.1:
        adjusted_peak = adjusted_peak + 1  # Still improving

    # Adjust recommendation
    recommendation = base_window.get("recommendation", "hold")
    if adjustment_factor < 0.85 and recommendation != "sell":
        recommendation = "sell"
    elif adjustment_factor > 1.15 and recommendation != "buy":
        recommendation = "buy"

    return {
        **base_window,
        "peak_years_left": adjusted_peak,
        "recommendation": recommendation,
        "trend_factor": round(adjustment_factor, 2),
        "trend_notes": trend_notes,
        "seasons_analyzed": len(per_season_stats),
    }
