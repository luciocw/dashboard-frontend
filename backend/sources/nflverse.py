"""
nflverse data source
Fonte: https://github.com/nflverse/nflverse-data
Licença: CC-BY-SA 4.0 (uso comercial permitido com atribuição)
"""

import pandas as pd
from typing import Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from cache import read_cache, write_cache

# URLs do nflverse-data releases
NFLVERSE_PLAYER_STATS_URL = "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_{season}.parquet"
NFLVERSE_PLAYER_STATS_DEF_URL = "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_def_{season}.parquet"
NFLVERSE_ROSTERS_URL = "https://github.com/nflverse/nflverse-data/releases/download/weekly_rosters/roster_weekly_{season}.parquet"

# Mapeamento de posições para Fantasy
POSITION_MAP = {
    # DL (Defensive Line)
    "DE": "DL",
    "DT": "DL",
    "NT": "DL",
    # LB (Linebacker)
    "LB": "LB",
    "ILB": "LB",
    "OLB": "LB",
    "MLB": "LB",
    # DB (Defensive Back)
    "CB": "DB",
    "S": "DB",
    "FS": "DB",
    "SS": "DB",
    "DB": "DB",
}

# Posições defensivas
DEFENSIVE_POSITIONS = list(POSITION_MAP.keys())

# Posições ofensivas
OFFENSIVE_POSITIONS = ["QB", "RB", "WR", "TE", "FB"]


def fetch_player_stats(season: int) -> pd.DataFrame:
    """
    Busca stats OFENSIVAS de jogadores do nflverse
    """
    cached = read_cache("nflverse_player_stats", season)
    if cached is not None:
        return pd.DataFrame(cached)

    url = NFLVERSE_PLAYER_STATS_URL.format(season=season)

    try:
        df = pd.read_parquet(url)
        write_cache("nflverse_player_stats", season, df.to_dict(orient="records"))
        return df
    except Exception as e:
        print(f"[nflverse] Erro ao buscar player_stats de {season}: {e}")
        return pd.DataFrame()


def fetch_player_stats_def(season: int) -> pd.DataFrame:
    """
    Busca stats DEFENSIVAS de jogadores do nflverse
    Tenta arquivo por temporada, senão usa arquivo consolidado
    """
    cached = read_cache("nflverse_player_stats_def", season)
    if cached is not None:
        return pd.DataFrame(cached)

    # Tenta arquivo específico da temporada primeiro
    url = NFLVERSE_PLAYER_STATS_DEF_URL.format(season=season)

    try:
        df = pd.read_parquet(url)
        write_cache("nflverse_player_stats_def", season, df.to_dict(orient="records"))
        return df
    except Exception as e:
        print(f"[nflverse] Arquivo {season} não encontrado, tentando arquivo consolidado...")

    # Fallback: arquivo consolidado com todas as temporadas
    try:
        consolidated_url = "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_def.parquet"
        df = pd.read_parquet(consolidated_url)
        # Filtra pela temporada desejada
        df = df[df["season"] == season]
        if not df.empty:
            write_cache("nflverse_player_stats_def", season, df.to_dict(orient="records"))
        return df
    except Exception as e2:
        print(f"[nflverse] Erro ao buscar player_stats_def: {e2}")
        return pd.DataFrame()


def get_available_seasons() -> list[int]:
    """
    Retorna lista de temporadas disponíveis no nflverse
    """
    cached = read_cache("nflverse_available_seasons", 0)
    if cached is not None:
        return cached

    try:
        url = "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_def.parquet"
        df = pd.read_parquet(url)
        seasons = sorted(df["season"].unique(), reverse=True)
        seasons_list = [int(s) for s in seasons]
        write_cache("nflverse_available_seasons", 0, seasons_list)
        return seasons_list
    except Exception as e:
        print(f"[nflverse] Erro ao buscar temporadas disponíveis: {e}")
        return [2024, 2023, 2022, 2021, 2020]


def fetch_rosters(season: int) -> pd.DataFrame:
    """
    Busca rosters com info de jogadores (idade, time, etc)
    """
    cached = read_cache("nflverse_rosters", season)
    if cached is not None:
        return pd.DataFrame(cached)

    url = NFLVERSE_ROSTERS_URL.format(season=season)

    try:
        df = pd.read_parquet(url)
        # Pega apenas a última semana para ter dados mais recentes
        if "week" in df.columns:
            max_week = df["week"].max()
            df = df[df["week"] == max_week]

        # Converte colunas de data para string antes de cachear (JSON não suporta date objects)
        for col in df.columns:
            if df[col].dtype == 'datetime64[ns]' or df[col].dtype == 'object':
                try:
                    # Tenta converter para string se for date/datetime
                    if hasattr(df[col].iloc[0] if len(df) > 0 else None, 'strftime'):
                        df[col] = df[col].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notna(x) and hasattr(x, 'strftime') else x)
                except Exception:
                    pass

        write_cache("nflverse_rosters", season, df.to_dict(orient="records"))
        return df
    except Exception as e:
        print(f"[nflverse] Erro ao buscar rosters de {season}: {e}")
        return pd.DataFrame()


def safe_int(value, default=0) -> int:
    """Converte valor para int de forma segura"""
    if pd.isna(value):
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def safe_float(value, default=0.0) -> float:
    """Converte valor para float de forma segura, lidando com NaN e Infinity"""
    if pd.isna(value):
        return default
    try:
        f = float(value)
        # Verifica se é NaN ou Infinity (inválido para JSON)
        if pd.isna(f) or f == float('inf') or f == float('-inf'):
            return default
        return f
    except (ValueError, TypeError):
        return default


def calculate_age(birth_date) -> Optional[int]:
    """Calcula idade a partir da data de nascimento"""
    if pd.isna(birth_date):
        return None
    try:
        from datetime import datetime
        if isinstance(birth_date, str):
            bd = datetime.strptime(birth_date, "%Y-%m-%d")
        else:
            bd = birth_date
        today = datetime.now()
        return today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
    except Exception:
        return None


def get_defensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats defensivas agregadas por jogador
    Stats exibidas na UI: TKL, SCK, TFL, PRES (qb_hits), PD, INT, FF
    """
    stats_df = fetch_player_stats_def(season)
    rosters_df = fetch_rosters(season)

    if stats_df.empty:
        return []

    # Todas as colunas defensivas disponíveis no nflverse
    def_columns = [
        "def_tackles", "def_tackles_solo", "def_tackles_with_assist",
        "def_tackle_assists", "def_tackles_for_loss", "def_tackles_for_loss_yards",
        "def_fumbles_forced", "def_sacks", "def_sack_yards",
        "def_qb_hits", "def_interceptions", "def_interception_yards",
        "def_pass_defended", "def_tds", "def_fumbles",
        "def_fumble_recovery_own", "def_fumble_recovery_yards_own",
        "def_fumble_recovery_opp", "def_fumble_recovery_yards_opp",
        "def_safety", "def_penalty", "def_penalty_yards"
    ]

    # Verifica quais colunas existem
    available_cols = [c for c in def_columns if c in stats_df.columns]

    if not available_cols:
        print(f"[nflverse] Colunas disponíveis: {stats_df.columns.tolist()}")
        return []

    # Filtra linhas com alguma stat defensiva
    has_def_stats = stats_df[available_cols].sum(axis=1) > 0
    def_df = stats_df[has_def_stats].copy()

    if def_df.empty:
        return []

    # Agrupa por jogador (temporada inteira)
    agg_dict = {col: "sum" for col in available_cols}
    for col in ["player_display_name", "player_name", "position", "recent_team"]:
        if col in def_df.columns:
            agg_dict[col] = "first"

    grouped = def_df.groupby("player_id").agg(agg_dict).reset_index()

    # Enriquece com dados do roster
    if not rosters_df.empty and "gsis_id" in rosters_df.columns:
        roster_info = rosters_df[["gsis_id", "headshot_url", "birth_date", "years_exp", "jersey_number", "team"]].drop_duplicates("gsis_id")
        grouped = grouped.merge(roster_info, left_on="player_id", right_on="gsis_id", how="left")

    # Converte para formato do frontend
    result = []
    for _, row in grouped.iterrows():
        pos = str(row.get("position", "LB")).upper()
        fantasy_pos = POSITION_MAP.get(pos, "LB")

        # Só inclui se for posição defensiva
        if pos not in DEFENSIVE_POSITIONS:
            continue

        # Calcula tackles totais
        tackles = safe_int(row.get("def_tackles", 0))
        if tackles == 0:
            tackles = safe_int(row.get("def_tackles_solo", 0)) + safe_int(row.get("def_tackle_assists", 0))

        player = {
            "id": str(row.get("player_id", "")),
            "name": row.get("player_display_name") or row.get("player_name", "Unknown"),
            "team": row.get("recent_team") or row.get("team", ""),
            "teamAbbr": row.get("recent_team") or row.get("team", ""),
            "photoUrl": row.get("headshot_url", ""),
            "espnPosition": pos,
            "fantasyPosition": fantasy_pos,
            "age": calculate_age(row.get("birth_date")) if pd.notna(row.get("birth_date")) else None,
            "experience": safe_int(row.get("years_exp")) if pd.notna(row.get("years_exp")) else None,
            "jerseyNumber": str(safe_int(row.get("jersey_number"))) if pd.notna(row.get("jersey_number")) else None,
            "stats": {
                # Stats principais (exibidas na UI)
                "tackles": tackles,
                "sacks": safe_float(row.get("def_sacks", 0)),
                "tfl": safe_int(row.get("def_tackles_for_loss", 0)),
                "qbHits": safe_int(row.get("def_qb_hits", 0)),  # PRES na UI
                "passesDefended": safe_int(row.get("def_pass_defended", 0)),
                "interceptions": safe_int(row.get("def_interceptions", 0)),
                "forcedFumbles": safe_int(row.get("def_fumbles_forced", 0)),
                # Stats adicionais (armazenadas mas não exibidas)
                "soloTackles": safe_int(row.get("def_tackles_solo", 0)),
                "assistTackles": safe_int(row.get("def_tackle_assists", 0)),
                "tacklesWithAssist": safe_int(row.get("def_tackles_with_assist", 0)),
                "tflYards": safe_int(row.get("def_tackles_for_loss_yards", 0)),
                "sackYards": safe_float(row.get("def_sack_yards", 0)),
                "intYards": safe_int(row.get("def_interception_yards", 0)),
                "defensiveTds": safe_int(row.get("def_tds", 0)),
                "fumbleRecoveryOwn": safe_int(row.get("def_fumble_recovery_own", 0)),
                "fumbleRecoveryOpp": safe_int(row.get("def_fumble_recovery_opp", 0)),
                "safeties": safe_int(row.get("def_safety", 0)),
            }
        }

        # Só adiciona se tiver alguma stat relevante
        if tackles > 0 or player["stats"]["sacks"] > 0 or player["stats"]["interceptions"] > 0:
            result.append(player)

    # Ordena por tackles (desc)
    result.sort(key=lambda x: x["stats"]["tackles"], reverse=True)

    return result


def get_offensive_stats(season: int = 2024) -> list[dict]:
    """
    Retorna stats ofensivas agregadas por jogador
    Stats por posição:
    - QB: CMP/ATT, RUSH_YDS, RUSH_TD, PASS_YDS, PASS_TD, INT, RTG
    - RB: ATT, YDS, YAC, BRK_TKL, RUSH_TD, REC_YDS, REC_TD, RZ_TGT, RZ_TD, FUM
    - WR/TE: TGT, YDS, YAC, AIR_YDS, REC, REC_TD, RUSH_TD, RZ_TGT, RZ_TD, DROPS
    """
    stats_df = fetch_player_stats(season)
    rosters_df = fetch_rosters(season)

    if stats_df.empty:
        return []

    # Todas as colunas ofensivas disponíveis no nflverse
    off_columns = [
        # Passing
        "completions", "attempts", "passing_yards", "passing_tds",
        "interceptions", "sacks", "sack_yards", "sack_fumbles",
        "sack_fumbles_lost", "passing_air_yards", "passing_yards_after_catch",
        "passing_first_downs", "passing_epa", "passing_2pt_conversions",
        "pacr", "dakota",
        # Rushing
        "carries", "rushing_yards", "rushing_tds", "rushing_fumbles",
        "rushing_fumbles_lost", "rushing_first_downs", "rushing_epa",
        "rushing_2pt_conversions",
        # Receiving
        "receptions", "targets", "receiving_yards", "receiving_tds",
        "receiving_air_yards", "receiving_yards_after_catch",
        "receiving_fumbles", "receiving_fumbles_lost",
        "receiving_first_downs", "receiving_epa", "receiving_2pt_conversions",
        "racr", "target_share", "air_yards_share", "wopr",
        # Fantasy
        "fantasy_points", "fantasy_points_ppr"
    ]

    available_cols = [c for c in off_columns if c in stats_df.columns]

    if not available_cols:
        return []

    # Filtra apenas posições ofensivas
    if "position" in stats_df.columns:
        off_df = stats_df[stats_df["position"].isin(OFFENSIVE_POSITIONS)].copy()
    else:
        off_df = stats_df.copy()

    if off_df.empty:
        return []

    # Agrupa por jogador
    agg_dict = {col: "sum" for col in available_cols}
    for col in ["player_display_name", "player_name", "position", "recent_team"]:
        if col in off_df.columns:
            agg_dict[col] = "first"

    grouped = off_df.groupby("player_id").agg(agg_dict).reset_index()

    # Enriquece com roster
    if not rosters_df.empty and "gsis_id" in rosters_df.columns:
        roster_info = rosters_df[["gsis_id", "headshot_url", "birth_date", "years_exp", "jersey_number", "team"]].drop_duplicates("gsis_id")
        grouped = grouped.merge(roster_info, left_on="player_id", right_on="gsis_id", how="left")

    result = []
    for _, row in grouped.iterrows():
        position = str(row.get("position", "")).upper()

        # Calcula passer rating (aproximado)
        attempts = safe_int(row.get("attempts", 0))
        completions = safe_int(row.get("completions", 0))
        passing_yards = safe_int(row.get("passing_yards", 0))
        passing_tds = safe_int(row.get("passing_tds", 0))
        ints = safe_int(row.get("interceptions", 0))

        passer_rating = 0.0
        if attempts > 0:
            a = max(0, min(2.375, ((completions / attempts) - 0.3) * 5))
            b = max(0, min(2.375, ((passing_yards / attempts) - 3) * 0.25))
            c = max(0, min(2.375, (passing_tds / attempts) * 20))
            d = max(0, min(2.375, 2.375 - ((ints / attempts) * 25)))
            passer_rating = round(((a + b + c + d) / 6) * 100, 1)

        # Total fumbles
        total_fumbles = (
            safe_int(row.get("rushing_fumbles", 0)) +
            safe_int(row.get("receiving_fumbles", 0)) +
            safe_int(row.get("sack_fumbles", 0))
        )

        player = {
            "id": str(row.get("player_id", "")),
            "name": row.get("player_display_name") or row.get("player_name", "Unknown"),
            "team": row.get("recent_team") or row.get("team", ""),
            "teamAbbr": row.get("recent_team") or row.get("team", ""),
            "photoUrl": row.get("headshot_url", ""),
            "position": position,
            "age": calculate_age(row.get("birth_date")) if pd.notna(row.get("birth_date")) else None,
            "experience": safe_int(row.get("years_exp")) if pd.notna(row.get("years_exp")) else None,
            "jerseyNumber": str(safe_int(row.get("jersey_number"))) if pd.notna(row.get("jersey_number")) else None,
            "stats": {
                # Passing stats (QB)
                "completions": completions,
                "attempts": attempts,
                "passingYards": passing_yards,
                "passingTds": passing_tds,
                "interceptions": ints,
                "passerRating": passer_rating,
                "passingAirYards": safe_int(row.get("passing_air_yards", 0)),
                "passingYac": safe_int(row.get("passing_yards_after_catch", 0)),
                "passingFirstDowns": safe_int(row.get("passing_first_downs", 0)),
                "sacks": safe_int(row.get("sacks", 0)),
                "sackYards": safe_int(row.get("sack_yards", 0)),

                # Rushing stats (QB, RB)
                "carries": safe_int(row.get("carries", 0)),
                "rushingYards": safe_int(row.get("rushing_yards", 0)),
                "rushingTds": safe_int(row.get("rushing_tds", 0)),
                "rushingFirstDowns": safe_int(row.get("rushing_first_downs", 0)),

                # Receiving stats (RB, WR, TE)
                "targets": safe_int(row.get("targets", 0)),
                "receptions": safe_int(row.get("receptions", 0)),
                "receivingYards": safe_int(row.get("receiving_yards", 0)),
                "receivingTds": safe_int(row.get("receiving_tds", 0)),
                "receivingAirYards": safe_int(row.get("receiving_air_yards", 0)),
                "receivingYac": safe_int(row.get("receiving_yards_after_catch", 0)),
                "receivingFirstDowns": safe_int(row.get("receiving_first_downs", 0)),

                # Fumbles
                "fumbles": total_fumbles,
                "fumblesLost": safe_int(row.get("rushing_fumbles_lost", 0)) + safe_int(row.get("receiving_fumbles_lost", 0)),

                # Advanced stats
                "targetShare": safe_float(row.get("target_share", 0)),
                "airYardsShare": safe_float(row.get("air_yards_share", 0)),
                "wopr": safe_float(row.get("wopr", 0)),
                "racr": safe_float(row.get("racr", 0)),
                "pacr": safe_float(row.get("pacr", 0)),

                # Fantasy
                "fantasyPoints": safe_float(row.get("fantasy_points", 0)),
                "fantasyPointsPpr": safe_float(row.get("fantasy_points_ppr", 0)),
            }
        }

        # Só adiciona se tiver stats significativas
        total_yards = player["stats"]["passingYards"] + player["stats"]["rushingYards"] + player["stats"]["receivingYards"]
        if total_yards > 0:
            result.append(player)

    # Ordena por fantasy points PPR (desc)
    result.sort(key=lambda x: x["stats"]["fantasyPointsPpr"], reverse=True)

    return result
