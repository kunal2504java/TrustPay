#!/bin/bash
PORT=${PORT:-8000}

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the server
echo "Starting server on port $PORT..."
uvicorn main:app --host 0.0.0.0 --port $PORT
