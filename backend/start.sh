#!/bin/bash
set -e  # Exit on error

PORT=${PORT:-8000}

# Run database migrations
echo "================================"
echo "Running database migrations..."
echo "================================"
alembic upgrade head || {
    echo "ERROR: Migration failed!"
    exit 1
}
echo "Migrations completed successfully!"

# Start the server
echo "================================"
echo "Starting server on port $PORT..."
echo "================================"
exec uvicorn main:app --host 0.0.0.0 --port $PORT
