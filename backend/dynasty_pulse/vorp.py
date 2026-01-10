# -*- coding: utf-8 -*-
"""
VORP (Value Over Replacement Player) Calculator

VORP = (Fantasy_Points_Per_Game - Replacement_Level) x Scarcity_Multiplier

Replacement level represents the typical "waiver wire player",
based on 12-team standard league.
"""

from typing import Dict, Literal

Position = Literal["QB", "RB", "WR", "TE", "K", "DL", "LB", "DB"]

# Replacement Level PPG (Points Per Game)
# Represents the typical waiver wire player in a 12-team league
REPLACEMENT_LEVEL: Dict[str, float] = {
    # Offense
    "QB": 15.0,
    "RB": 8.0,
    "WR": 7.5,
    "TE": 5.0,
    "K": 6.0,
    # IDP
    "DL": 4.0,
    "LB": 6.0,
    "DB": 3.5,
}

# Scarcity Multiplier
# Scarcer positions are worth more (RB > WR, etc)
SCARCITY_MULTIPLIER: Dict[str, float] = {
    # Offense - standard league (1QB)
    "QB": 1.0,
    "RB": 1.3,
    "WR": 1.0,
    "TE": 1.1,
    "K": 0.3,
    # IDP
    "DL": 0.9,
    "LB": 1.0,
    "DB": 0.8,
}

# Superflex multiplier para QB
SF_QB_MULTIPLIER = 1.8

# TEP (Tight End Premium) multiplier
TEP_TE_MULTIPLIER = 1.4


def calculate_vorp(
    ppg: float,
    position: str,
    is_superflex: bool = False,
    is_tep: bool = False,
) -> float:
    """
    Calcula VORP (Value Over Replacement Player)

    Args:
        ppg: Fantasy points per game (PPR)
        position: Posição do jogador (QB, RB, WR, TE, K, DL, LB, DB)
        is_superflex: Se liga é Superflex (boost QBs)
        is_tep: Se liga tem TE Premium (boost TEs)

    Returns:
        VORP score (pode ser negativo se jogador está abaixo do replacement)
    """
    pos = position.upper()

    # Posições não suportadas retornam 0
    if pos not in REPLACEMENT_LEVEL:
        return 0.0

    replacement = REPLACEMENT_LEVEL[pos]
    scarcity = SCARCITY_MULTIPLIER[pos]

    # Ajustes para formatos especiais
    if pos == "QB" and is_superflex:
        scarcity = SF_QB_MULTIPLIER
    elif pos == "TE" and is_tep:
        scarcity = TEP_TE_MULTIPLIER

    # VORP = (PPG - Replacement) × Scarcity
    vorp = (ppg - replacement) * scarcity

    return vorp


def calculate_ppg_from_stats(stats: dict, position: str) -> float:
    """
    Calcula PPG (Points Per Game) a partir das stats

    Args:
        stats: Dicionário com stats do jogador
        position: Posição do jogador

    Returns:
        Fantasy points per game (PPR scoring)
    """
    pos = position.upper()

    # Para offense, usa fantasy_points_ppr diretamente se disponível
    if pos in ["QB", "RB", "WR", "TE", "K"]:
        total_points = stats.get("fantasyPointsPpr", 0) or stats.get("fantasy_points_ppr", 0)
        games = stats.get("games", 0) or stats.get("games_played", 17)

        if games > 0 and total_points > 0:
            return total_points / games

        # Fallback: calcula manualmente baseado em stats
        return _calculate_offensive_ppg(stats, pos)

    # Para IDP, calcula baseado em scoring típico
    return _calculate_idp_ppg(stats, pos)


def _calculate_offensive_ppg(stats: dict, position: str) -> float:
    """
    Calcula PPG para jogadores ofensivos baseado em PPR scoring
    """
    points = 0.0
    games = max(1, stats.get("games", 17))

    # Passing (QB mainly)
    points += stats.get("passingYards", 0) * 0.04  # 1 pt / 25 yards
    points += stats.get("passingTds", 0) * 4
    points += stats.get("interceptions", 0) * -2

    # Rushing
    points += stats.get("rushingYards", 0) * 0.1  # 1 pt / 10 yards
    points += stats.get("rushingTds", 0) * 6

    # Receiving (PPR)
    points += stats.get("receptions", 0) * 1  # PPR
    points += stats.get("receivingYards", 0) * 0.1
    points += stats.get("receivingTds", 0) * 6

    # Fumbles
    points += stats.get("fumblesLost", 0) * -2

    return points / games


def _calculate_idp_ppg(stats: dict, position: str) -> float:
    """
    Calcula PPG para jogadores IDP baseado em scoring típico

    Scoring padrão IDP:
    - Solo tackle: 1.0
    - Assisted tackle: 0.5
    - Sack: 2.0
    - TFL: 1.0
    - QB Hit: 0.5
    - INT: 3.0
    - Pass Defended: 1.0
    - Forced Fumble: 2.0
    - Fumble Recovery: 2.0
    - Defensive TD: 6.0
    """
    points = 0.0

    # Tackles
    solo = stats.get("soloTackles", 0) or stats.get("tackles", 0)
    assists = stats.get("assistTackles", 0)
    points += solo * 1.0
    points += assists * 0.5

    # Big plays
    points += stats.get("sacks", 0) * 2.0
    points += stats.get("tfl", 0) * 1.0
    points += stats.get("qbHits", 0) * 0.5

    # Turnovers
    points += stats.get("interceptions", 0) * 3.0
    points += stats.get("passesDefended", 0) * 1.0
    points += stats.get("forcedFumbles", 0) * 2.0

    # Fumble recovery (se disponível)
    fumble_rec = stats.get("fumbleRecoveryOpp", 0) + stats.get("fumbleRecoveryOwn", 0)
    points += fumble_rec * 2.0

    # Defensive TDs
    points += stats.get("defensiveTds", 0) * 6.0

    # Assume 17 games por temporada
    games = max(1, stats.get("games", 17))

    return points / games


def get_vorp_tier(vorp: float, position: str) -> str:
    """
    Retorna tier do jogador baseado no VORP

    Tiers:
    - Elite: Top 5% da posição
    - Star: Top 15%
    - Starter: Top 30%
    - Depth: Top 50%
    - Replacement: Abaixo de 50%
    """
    # Thresholds por posição (ajustados para PPR)
    thresholds = {
        "QB": {"elite": 12, "star": 8, "starter": 4, "depth": 0},
        "RB": {"elite": 10, "star": 6, "starter": 3, "depth": 0},
        "WR": {"elite": 8, "star": 5, "starter": 2, "depth": 0},
        "TE": {"elite": 6, "star": 4, "starter": 2, "depth": 0},
        "K": {"elite": 3, "star": 2, "starter": 1, "depth": 0},
        "DL": {"elite": 5, "star": 3, "starter": 1.5, "depth": 0},
        "LB": {"elite": 6, "star": 4, "starter": 2, "depth": 0},
        "DB": {"elite": 4, "star": 2.5, "starter": 1, "depth": 0},
    }

    pos = position.upper()
    if pos not in thresholds:
        return "unknown"

    t = thresholds[pos]

    if vorp >= t["elite"]:
        return "elite"
    elif vorp >= t["star"]:
        return "star"
    elif vorp >= t["starter"]:
        return "starter"
    elif vorp >= t["depth"]:
        return "depth"
    else:
        return "replacement"
