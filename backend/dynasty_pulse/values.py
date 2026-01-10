# -*- coding: utf-8 -*-
"""
Dynasty Value Calculator

Combines VORP + Aging to generate final value 0-10000
UI displays as 0-100 (divides by 100)
"""

from typing import Dict, List, Optional, TypedDict
import sys
from pathlib import Path

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from .vorp import calculate_vorp, calculate_ppg_from_stats, get_vorp_tier
from .aging import calculate_age_factor, get_age_tier, get_dynasty_window

# Base multiplier to convert VORP to 0-10000 scale
# Adjusted so elite players land at 9000-10000
VORP_MULTIPLIER = 750

# Position normalization factors
# IDP has lower raw PPG, so we boost their values to be competitive
POSITION_VALUE_BOOST: Dict[str, float] = {
    "QB": 1.0,
    "RB": 1.1,  # RBs slightly boosted for scarcity
    "WR": 1.0,
    "TE": 1.0,
    "K": 0.5,   # Kickers worth less in dynasty
    # IDP boost - their VORP is lower due to lower PPG
    "DL": 3.5,  # Elite DL like Parsons should be 65-75
    "LB": 2.5,  # Elite LB should be 55-65
    "DB": 2.2,  # Elite DB should be 45-55
}

# Bonus for young players (potential)
YOUTH_BONUS_MULTIPLIER = 1.15

# Minimum and maximum values
MIN_VALUE = 0
MAX_VALUE = 10000


class PlayerValueBreakdown(TypedDict):
    """Breakdown detalhado do cálculo de valor"""

    player_id: str
    name: str
    position: str
    team: Optional[str]
    age: Optional[int]
    # Componentes do cálculo
    ppg: float
    vorp: float
    vorp_tier: str
    age_factor: float
    age_tier: str
    # Valor final
    raw_value: float
    final_value: int
    display_value: float  # 0-100 para UI
    # Dynasty info
    dynasty_window: dict


def calculate_player_value(
    stats: dict,
    position: str,
    age: Optional[int] = None,
    is_superflex: bool = False,
    is_tep: bool = False,
) -> int:
    """
    Calculate dynasty value of a player (0-10000)

    Args:
        stats: Dict with player stats
        position: Position (QB, RB, WR, TE, K, DL, LB, DB)
        age: Age (None = uses 26)
        is_superflex: Superflex league
        is_tep: TE premium league

    Returns:
        Value between 0 and 10000
    """
    pos = position.upper()

    # 1. Calculate PPG
    ppg = calculate_ppg_from_stats(stats, pos)

    # 2. Calculate VORP
    vorp = calculate_vorp(ppg, pos, is_superflex, is_tep)

    # 3. Calculate age factor
    age_factor = calculate_age_factor(age, pos)

    # 4. Youth bonus (players < 25 with good VORP)
    youth_bonus = 1.0
    if age is not None and age < 25 and vorp > 0:
        youth_bonus = YOUTH_BONUS_MULTIPLIER

    # 5. Position boost (IDP needs boost due to lower PPG)
    position_boost = POSITION_VALUE_BOOST.get(pos, 1.0)

    # 6. Calculate raw value
    # VORP can be negative, but minimum value is 0
    raw_value = max(0, vorp) * age_factor * youth_bonus * position_boost * VORP_MULTIPLIER

    # 7. Normalize to 0-10000
    final_value = int(max(MIN_VALUE, min(MAX_VALUE, raw_value)))

    return final_value


def get_player_value_breakdown(
    player_id: str,
    name: str,
    stats: dict,
    position: str,
    team: Optional[str] = None,
    age: Optional[int] = None,
    is_superflex: bool = False,
    is_tep: bool = False,
) -> PlayerValueBreakdown:
    """
    Returns complete breakdown of value calculation

    Useful for debugging and showing in UI how the value was calculated
    """
    pos = position.upper()

    # Calculations
    ppg = calculate_ppg_from_stats(stats, pos)
    vorp = calculate_vorp(ppg, pos, is_superflex, is_tep)
    vorp_tier = get_vorp_tier(vorp, pos)
    age_factor = calculate_age_factor(age, pos)
    age_tier = get_age_tier(age, pos)
    dynasty_window = get_dynasty_window(age, pos)

    # Youth bonus
    youth_bonus = 1.0
    if age is not None and age < 25 and vorp > 0:
        youth_bonus = YOUTH_BONUS_MULTIPLIER

    # Position boost (IDP needs boost)
    position_boost = POSITION_VALUE_BOOST.get(pos, 1.0)

    # Raw and final value
    raw_value = max(0, vorp) * age_factor * youth_bonus * position_boost * VORP_MULTIPLIER
    final_value = int(max(MIN_VALUE, min(MAX_VALUE, raw_value)))
    display_value = round(final_value / 100, 1)

    return {
        "player_id": player_id,
        "name": name,
        "position": pos,
        "team": team,
        "age": age,
        "ppg": round(ppg, 2),
        "vorp": round(vorp, 2),
        "vorp_tier": vorp_tier,
        "age_factor": round(age_factor, 3),
        "age_tier": age_tier,
        "raw_value": round(raw_value, 2),
        "final_value": final_value,
        "display_value": display_value,
        "dynasty_window": dynasty_window,
    }


def calculate_all_player_values(
    offensive_players: List[Dict],
    defensive_players: List[Dict],
    is_superflex: bool = False,
    is_tep: bool = False,
) -> Dict[str, Dict]:
    """
    Calcula valores para todos os jogadores

    Args:
        offensive_players: Lista de jogadores ofensivos (do endpoint /api/stats/offense)
        defensive_players: Lista de jogadores defensivos (do endpoint /api/stats/defense)
        is_superflex: Liga superflex
        is_tep: Liga com TE premium

    Returns:
        Dict mapeando player_id para valor e metadata
    """
    values = {}

    # Processa jogadores ofensivos
    for player in offensive_players:
        player_id = player.get("id", "")
        if not player_id:
            continue

        position = player.get("position", "")
        if position not in ["QB", "RB", "WR", "TE", "K"]:
            continue

        stats = player.get("stats", {})
        age = player.get("age")
        name = player.get("name", "Unknown")
        team = player.get("team") or player.get("teamAbbr")

        breakdown = get_player_value_breakdown(
            player_id=player_id,
            name=name,
            stats=stats,
            position=position,
            team=team,
            age=age,
            is_superflex=is_superflex,
            is_tep=is_tep,
        )

        values[player_id] = breakdown

    # Processa jogadores defensivos
    for player in defensive_players:
        player_id = player.get("id", "")
        if not player_id:
            continue

        position = player.get("fantasyPosition", player.get("position", ""))
        if position not in ["DL", "LB", "DB"]:
            continue

        stats = player.get("stats", {})
        age = player.get("age")
        name = player.get("name", "Unknown")
        team = player.get("team") or player.get("teamAbbr")

        breakdown = get_player_value_breakdown(
            player_id=player_id,
            name=name,
            stats=stats,
            position=position,
            team=team,
            age=age,
            is_superflex=is_superflex,
            is_tep=is_tep,
        )

        values[player_id] = breakdown

    return values


def get_pick_values(season: int = 2026) -> Dict[str, int]:
    """
    Retorna valores de draft picks

    Picks são baseados em valor médio esperado de rookies
    Early picks valem mais que late picks

    Format: {year}-{round}-{range}
    Range: early (1-4), mid (5-8), late (9-12) para 1st/2nd round
    """
    # Base value por round (diminui com distância temporal)
    current_year = 2025  # Ajustar conforme necessário
    year_discount = 0.90  # 10% de desconto por ano de distância

    # Valores base (escala 0-10000)
    base_values = {
        # 1st round
        "1-early": 8500,
        "1-mid": 7000,
        "1-late": 5500,
        # 2nd round
        "2-early": 3500,
        "2-mid": 2800,
        "2-late": 2200,
        # 3rd round
        "3": 1200,
        # 4th round
        "4": 500,
    }

    picks = {}
    years = [2025, 2026, 2027, 2028]

    for year in years:
        years_away = year - current_year
        discount = year_discount ** years_away

        for pick_key, base_value in base_values.items():
            full_key = f"{year}-{pick_key}"
            picks[full_key] = int(base_value * discount)

    return picks


def value_to_display(value: int) -> float:
    """
    Converte valor interno (0-10000) para display (0-100)
    """
    return round(value / 100, 1)


def display_to_value(display: float) -> int:
    """
    Converte display (0-100) para valor interno (0-10000)
    """
    return int(display * 100)
