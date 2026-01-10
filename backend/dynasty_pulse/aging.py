# -*- coding: utf-8 -*-
"""
Position-based Aging Curves

Models how a player's value changes with age.
Each position has:
- peak_start: Age where prime begins
- peak_end: Age where prime ends
- decay_rate: % loss per year after peak

Based on NFL aging curve studies.
"""

from typing import Dict, TypedDict, Optional, Union


class AgingCurve(TypedDict):
    peak_start: int
    peak_end: int
    decay_rate: float  # % per year after peak
    pre_peak_growth: float  # % growth per year before peak


# Aging Curves by position
AGING_CURVES: Dict[str, AgingCurve] = {
    # Offense
    "QB": {
        "peak_start": 26,
        "peak_end": 32,
        "decay_rate": 0.03,  # 3% por ano
        "pre_peak_growth": 0.04,  # 4% por ano
    },
    "RB": {
        "peak_start": 23,
        "peak_end": 26,
        "decay_rate": 0.10,  # 10% por ano - RBs declinam rápido
        "pre_peak_growth": 0.05,
    },
    "WR": {
        "peak_start": 25,
        "peak_end": 29,
        "decay_rate": 0.05,  # 5% por ano
        "pre_peak_growth": 0.04,
    },
    "TE": {
        "peak_start": 26,
        "peak_end": 30,
        "decay_rate": 0.04,  # 4% por ano
        "pre_peak_growth": 0.03,
    },
    "K": {
        "peak_start": 26,
        "peak_end": 36,
        "decay_rate": 0.02,  # Kickers duram mais
        "pre_peak_growth": 0.02,
    },
    # IDP
    "DL": {
        "peak_start": 25,
        "peak_end": 29,
        "decay_rate": 0.06,  # 6% por ano
        "pre_peak_growth": 0.04,
    },
    "LB": {
        "peak_start": 24,
        "peak_end": 28,
        "decay_rate": 0.07,  # 7% por ano
        "pre_peak_growth": 0.04,
    },
    "DB": {
        "peak_start": 25,
        "peak_end": 29,
        "decay_rate": 0.06,  # 6% por ano
        "pre_peak_growth": 0.04,
    },
}

# Idade mínima e máxima para NFL
MIN_AGE = 21
MAX_AGE = 40
DEFAULT_AGE = 26


def calculate_age_factor(age: Optional[int], position: str) -> float:
    """
    Calcula multiplicador de idade (0.0 - 1.0)

    Args:
        age: Idade do jogador (None usa DEFAULT_AGE)
        position: Posição do jogador

    Returns:
        Multiplicador entre 0.0 e 1.0
        - 1.0 = no prime
        - < 1.0 = antes ou depois do prime
    """
    if age is None:
        age = DEFAULT_AGE

    pos = position.upper()

    # Posição desconhecida = assume fator 1.0
    if pos not in AGING_CURVES:
        return 1.0

    curve = AGING_CURVES[pos]
    peak_start = curve["peak_start"]
    peak_end = curve["peak_end"]
    decay_rate = curve["decay_rate"]
    pre_peak_growth = curve["pre_peak_growth"]

    # Limite de idade
    age = max(MIN_AGE, min(MAX_AGE, age))

    if age < peak_start:
        # Antes do prime - ainda crescendo
        years_to_peak = peak_start - age
        # Começa em 0.80 aos 21 e cresce até 1.0 no peak
        base = 0.80
        growth = min(1.0, base + (age - MIN_AGE) * pre_peak_growth)
        return growth

    elif age <= peak_end:
        # No prime - valor máximo
        return 1.0

    else:
        # Pós-prime - declinando
        years_past_peak = age - peak_end
        decline = years_past_peak * decay_rate
        # Nunca vai abaixo de 0.20 (ainda tem algum valor)
        return max(0.20, 1.0 - decline)


def get_age_tier(age: Optional[int], position: str) -> str:
    """
    Retorna tier de idade do jogador

    Tiers:
    - rising: Jovem, ainda não chegou no peak
    - prime: No auge
    - declining: Pós-prime, declinando
    - veteran: Velho, valor baixo
    """
    if age is None:
        return "unknown"

    pos = position.upper()
    if pos not in AGING_CURVES:
        return "unknown"

    curve = AGING_CURVES[pos]

    if age < curve["peak_start"]:
        return "rising"
    elif age <= curve["peak_end"]:
        return "prime"
    elif age <= curve["peak_end"] + 3:
        return "declining"
    else:
        return "veteran"


def get_years_of_peak(age: Optional[int], position: str) -> int:
    """
    Retorna quantos anos de prime o jogador ainda tem

    Args:
        age: Idade atual
        position: Posição

    Returns:
        Anos restantes de prime (0 se já passou)
    """
    if age is None:
        age = DEFAULT_AGE

    pos = position.upper()
    if pos not in AGING_CURVES:
        return 0

    curve = AGING_CURVES[pos]
    peak_end = curve["peak_end"]

    if age > peak_end:
        return 0

    return peak_end - age


def project_future_age_factor(
    current_age: Optional[int],
    position: str,
    years_ahead: int = 1,
) -> float:
    """
    Projeta o age factor para X anos no futuro

    Útil para avaliar trades de longo prazo
    """
    if current_age is None:
        current_age = DEFAULT_AGE

    future_age = current_age + years_ahead
    return calculate_age_factor(future_age, position)


def get_dynasty_window(age: Optional[int], position: str) -> Dict:
    """
    Retorna informações sobre a janela dynasty do jogador

    Returns:
        dict com:
        - current_factor: Fator de idade atual
        - peak_years_left: Anos de prime restantes
        - projected_3yr: Fator projetado em 3 anos
        - tier: Tier de idade
        - recommendation: buy/hold/sell
    """
    if age is None:
        age = DEFAULT_AGE

    current_factor = calculate_age_factor(age, position)
    peak_years = get_years_of_peak(age, position)
    projected_3yr = project_future_age_factor(age, position, 3)
    tier = get_age_tier(age, position)

    # Recomendação baseada na projeção
    if tier == "rising" and peak_years >= 3:
        recommendation = "buy"
    elif tier == "prime" and peak_years >= 2:
        recommendation = "hold"
    elif tier == "declining" or (tier == "prime" and peak_years < 2):
        recommendation = "sell"
    else:
        recommendation = "sell"

    return {
        "current_factor": current_factor,
        "peak_years_left": peak_years,
        "projected_3yr": projected_3yr,
        "tier": tier,
        "recommendation": recommendation,
    }
