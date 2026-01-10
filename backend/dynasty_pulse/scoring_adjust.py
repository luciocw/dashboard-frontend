# -*- coding: utf-8 -*-
"""
Scoring Settings Adjustment (Premium Feature)

Adjusts player values based on league-specific scoring settings.
This is the key differentiator for premium users - personalized values
based on their actual league rules.

Example adjustments:
- TEP (TE Premium): TEs worth more in leagues with bonus_rec_te
- Superflex: QBs worth more (already handled in vorp.py)
- IDP Scoring: Adjust DL/LB/DB based on tackle/sack/INT points
- PPR vs Standard: Adjust WR/RB value based on reception points
"""

from typing import Dict, Optional, Tuple

# Standard scoring values (baseline for comparison)
STANDARD_SCORING: Dict[str, float] = {
    # Passing
    "pass_yd": 0.04,      # 1 pt per 25 yards
    "pass_td": 4.0,
    "pass_int": -2.0,
    "pass_2pt": 2.0,

    # Rushing
    "rush_yd": 0.1,       # 1 pt per 10 yards
    "rush_td": 6.0,
    "rush_2pt": 2.0,

    # Receiving
    "rec": 1.0,           # PPR
    "rec_yd": 0.1,
    "rec_td": 6.0,
    "rec_2pt": 2.0,
    "bonus_rec_te": 0.0,  # TE Premium bonus

    # Kicking
    "fgm": 3.0,
    "fgmiss": -1.0,
    "xpm": 1.0,

    # IDP - Tackles
    "tkl_solo": 1.0,
    "tkl_ast": 0.5,
    "tkl_loss": 1.0,
    "tkl": 1.0,           # Some leagues use combined

    # IDP - Big Plays
    "sack": 2.0,
    "qb_hit": 0.5,
    "ff": 2.0,            # Forced fumble
    "fum_rec": 2.0,       # Fumble recovery

    # IDP - Coverage
    "int": 3.0,
    "pass_def": 1.0,
    "def_td": 6.0,
    "safe": 2.0,

    # Fumbles (offense)
    "fum_lost": -2.0,
}

# Sleeper scoring key mappings (Sleeper uses slightly different keys)
SLEEPER_KEY_MAP: Dict[str, str] = {
    "pass_yd": "pass_yd",
    "pass_td": "pass_td",
    "pass_int": "pass_int",
    "pass_2pt": "pass_2pt",
    "rush_yd": "rush_yd",
    "rush_td": "rush_td",
    "rush_2pt": "rush_2pt",
    "rec": "rec",
    "rec_yd": "rec_yd",
    "rec_td": "rec_td",
    "rec_2pt": "rec_2pt",
    "bonus_rec_te": "bonus_rec_te",
    "fgm": "fgm",
    "fgmiss": "fgmiss",
    "xpm": "xpm",
    "idp_tkl_solo": "tkl_solo",
    "idp_tkl_ast": "tkl_ast",
    "idp_tkl_loss": "tkl_loss",
    "idp_tkl": "tkl",
    "idp_sack": "sack",
    "idp_qb_hit": "qb_hit",
    "idp_ff": "ff",
    "idp_fum_rec": "fum_rec",
    "idp_int": "int",
    "idp_pass_def": "pass_def",
    "idp_def_td": "def_td",
    "idp_safe": "safe",
    "fum_lost": "fum_lost",
}


def normalize_scoring_settings(scoring_settings: Dict) -> Dict[str, float]:
    """
    Normalizes Sleeper scoring_settings to our standard format.

    Args:
        scoring_settings: Raw scoring_settings from Sleeper API

    Returns:
        Normalized dict with standard keys
    """
    normalized = dict(STANDARD_SCORING)  # Start with defaults

    for sleeper_key, our_key in SLEEPER_KEY_MAP.items():
        if sleeper_key in scoring_settings:
            normalized[our_key] = float(scoring_settings[sleeper_key])

    return normalized


def calculate_scoring_multiplier(
    scoring_settings: Dict,
    position: str,
) -> Tuple[float, Dict[str, float]]:
    """
    Calculates value multiplier based on league scoring settings.

    Args:
        scoring_settings: League scoring settings (from Sleeper API)
        position: Player position (QB, RB, WR, TE, K, DL, LB, DB)

    Returns:
        Tuple of (multiplier, breakdown_dict)
        - multiplier: Float to multiply base value by
        - breakdown_dict: Explanation of adjustments made
    """
    settings = normalize_scoring_settings(scoring_settings)
    pos = position.upper()

    multiplier = 1.0
    breakdown: Dict[str, float] = {}

    # === RECEIVING ADJUSTMENTS ===
    if pos in ["WR", "RB", "TE"]:
        # PPR adjustment
        rec_pts = settings.get("rec", 1.0)
        if rec_pts != 1.0:
            # Half PPR = 0.5, Standard = 0, Full PPR = 1.0
            ppr_adjust = 1.0 + (rec_pts - 1.0) * 0.1  # ±10% for each point difference
            if pos == "WR":
                ppr_adjust = 1.0 + (rec_pts - 1.0) * 0.15  # WRs affected more
            elif pos == "RB":
                ppr_adjust = 1.0 + (rec_pts - 1.0) * 0.08  # RBs less affected

            multiplier *= ppr_adjust
            breakdown["ppr"] = round((ppr_adjust - 1.0) * 100, 1)

    # === TE PREMIUM ===
    if pos == "TE":
        te_bonus = settings.get("bonus_rec_te", 0.0)
        if te_bonus > 0:
            # Each point of TE premium adds ~15% value
            tep_adjust = 1.0 + te_bonus * 0.15
            multiplier *= tep_adjust
            breakdown["tep"] = round((tep_adjust - 1.0) * 100, 1)

    # === PASSING ADJUSTMENTS ===
    if pos == "QB":
        # 6pt passing TDs (vs standard 4pt)
        pass_td_pts = settings.get("pass_td", 4.0)
        if pass_td_pts != 4.0:
            td_adjust = 1.0 + (pass_td_pts - 4.0) * 0.08  # 8% per point difference
            multiplier *= td_adjust
            breakdown["pass_td"] = round((td_adjust - 1.0) * 100, 1)

        # Passing yards bonus/penalty
        pass_yd_pts = settings.get("pass_yd", 0.04)
        if pass_yd_pts != 0.04:
            yd_adjust = 1.0 + (pass_yd_pts - 0.04) * 2.0  # Very sensitive
            multiplier *= yd_adjust
            breakdown["pass_yd"] = round((yd_adjust - 1.0) * 100, 1)

    # === IDP ADJUSTMENTS ===
    if pos in ["DL", "LB", "DB"]:
        # Tackle scoring
        tkl_solo = settings.get("tkl_solo", 1.0)
        tkl_ast = settings.get("tkl_ast", 0.5)

        # Combined tackle value vs standard
        tkl_value = tkl_solo + (tkl_ast * 0.5)  # Weighted
        std_tkl_value = 1.0 + (0.5 * 0.5)

        if tkl_value != std_tkl_value:
            tkl_adjust = 1.0 + (tkl_value / std_tkl_value - 1.0) * 0.2
            # LBs most affected by tackle scoring
            if pos == "LB":
                tkl_adjust = 1.0 + (tkl_value / std_tkl_value - 1.0) * 0.3
            multiplier *= tkl_adjust
            breakdown["tackles"] = round((tkl_adjust - 1.0) * 100, 1)

        # Sack scoring
        sack_pts = settings.get("sack", 2.0)
        if sack_pts != 2.0:
            sack_adjust = 1.0 + (sack_pts / 2.0 - 1.0) * 0.15
            # DL most affected by sack scoring
            if pos == "DL":
                sack_adjust = 1.0 + (sack_pts / 2.0 - 1.0) * 0.25
            multiplier *= sack_adjust
            breakdown["sacks"] = round((sack_adjust - 1.0) * 100, 1)

        # INT scoring
        int_pts = settings.get("int", 3.0)
        if int_pts != 3.0:
            int_adjust = 1.0 + (int_pts / 3.0 - 1.0) * 0.1
            # DBs most affected by INT scoring
            if pos == "DB":
                int_adjust = 1.0 + (int_pts / 3.0 - 1.0) * 0.2
            multiplier *= int_adjust
            breakdown["ints"] = round((int_adjust - 1.0) * 100, 1)

        # Pass defended
        pd_pts = settings.get("pass_def", 1.0)
        if pd_pts != 1.0:
            pd_adjust = 1.0 + (pd_pts / 1.0 - 1.0) * 0.08
            if pos == "DB":
                pd_adjust = 1.0 + (pd_pts / 1.0 - 1.0) * 0.12
            multiplier *= pd_adjust
            breakdown["pass_def"] = round((pd_adjust - 1.0) * 100, 1)

    # === KICKER ADJUSTMENTS ===
    if pos == "K":
        fgm_pts = settings.get("fgm", 3.0)
        if fgm_pts != 3.0:
            fg_adjust = 1.0 + (fgm_pts / 3.0 - 1.0) * 0.3
            multiplier *= fg_adjust
            breakdown["fgm"] = round((fg_adjust - 1.0) * 100, 1)

    # Clamp multiplier to reasonable range
    multiplier = max(0.5, min(2.0, multiplier))

    return multiplier, breakdown


def apply_scoring_adjustment(
    base_value: int,
    scoring_settings: Dict,
    position: str,
) -> Tuple[int, float, Dict[str, float]]:
    """
    Applies scoring adjustment to a base value.

    Args:
        base_value: Base dynasty value (0-10000)
        scoring_settings: League scoring settings
        position: Player position

    Returns:
        Tuple of (adjusted_value, multiplier, breakdown)
    """
    multiplier, breakdown = calculate_scoring_multiplier(scoring_settings, position)
    adjusted_value = int(base_value * multiplier)
    adjusted_value = max(0, min(10000, adjusted_value))

    return adjusted_value, multiplier, breakdown


def get_league_type_description(scoring_settings: Dict) -> str:
    """
    Returns a human-readable description of the league type.

    Examples:
    - "Full PPR, TEP, 6pt Pass TD"
    - "Half PPR, Standard IDP"
    - "Standard, Heavy IDP"
    """
    settings = normalize_scoring_settings(scoring_settings)
    parts = []

    # PPR type
    rec_pts = settings.get("rec", 1.0)
    if rec_pts >= 1.0:
        parts.append("Full PPR")
    elif rec_pts >= 0.5:
        parts.append("Half PPR")
    else:
        parts.append("Standard")

    # TE Premium
    if settings.get("bonus_rec_te", 0) > 0:
        parts.append("TEP")

    # Passing TD
    pass_td = settings.get("pass_td", 4.0)
    if pass_td >= 6:
        parts.append("6pt Pass TD")

    # IDP intensity
    sack_pts = settings.get("sack", 2.0)
    tkl_pts = settings.get("tkl_solo", 1.0)
    if sack_pts >= 3 or tkl_pts >= 1.5:
        parts.append("Heavy IDP")
    elif sack_pts > 0 or tkl_pts > 0:
        parts.append("IDP")

    return ", ".join(parts) if parts else "Standard"


def detect_superflex(scoring_settings: Dict, roster_positions: Optional[list] = None) -> bool:
    """
    Detects if a league is Superflex based on roster positions.

    Args:
        scoring_settings: League scoring settings
        roster_positions: List of roster positions (from Sleeper league settings)

    Returns:
        True if league is Superflex
    """
    if roster_positions is None:
        return False

    # Superflex indicators
    sf_positions = ["SUPER_FLEX", "QB/WR/RB/TE", "OP"]

    for pos in roster_positions:
        if pos.upper() in sf_positions or "SUPER" in pos.upper():
            return True

    # Count QB slots - 2+ QB slots also indicates SF-like
    qb_count = sum(1 for p in roster_positions if p.upper() == "QB")
    if qb_count >= 2:
        return True

    return False
