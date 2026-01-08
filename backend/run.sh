#!/bin/bash
# Start NFL Stats API

cd "$(dirname "$0")"

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
fi

echo "Starting NFL Stats API on http://localhost:8000"
python3 -m uvicorn main:app --reload --port 8000
