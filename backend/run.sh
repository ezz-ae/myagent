#!/bin/bash
cd /Users/mahmoudezz/LocalAgent/backend
export OLLAMA_BASE_URL="http://localhost:11434/v1"
export AI_RUNTIME_BASE_URL="${OLLAMA_BASE_URL}"
exec ./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
