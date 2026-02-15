#!/bin/bash
cd "$(dirname "$0")/ai-service" || exit
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found. Please create it first."
    exit 1
fi
uvicorn app.main:app --reload --port 8000
