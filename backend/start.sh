#!/bin/bash
# Railway startup script that properly handles the PORT environment variable

# Get the port from environment variable, default to 8000 if not set
PORT=${PORT:-8000}

# Start uvicorn with the port
uvicorn main:app --host 0.0.0.0 --port $PORT
