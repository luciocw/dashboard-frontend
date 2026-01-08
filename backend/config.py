"""
Configuration module for NFL Stats API
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if present
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# RapidAPI / Tank01 Config
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
TANK01_BASE_URL = "https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"

# Primary data source: "tank01" or "nflverse"
# Will fallback to the other if primary fails
PRIMARY_SOURCE = os.getenv("PRIMARY_SOURCE", "tank01")

# Cache TTL settings (in seconds)
CACHE_TTL_TANK01 = 3600      # 1 hour - live data
CACHE_TTL_NFLVERSE = 86400   # 24 hours - historical data

# Request timeout (seconds)
REQUEST_TIMEOUT = 30

# Debug mode
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
