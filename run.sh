#!/bin/bash
# Script to run the entire Bizify application using Docker Compose

echo "Starting Bizify application..."
echo "This will start the PostgreSQL database, backend API, and frontend services."
echo "Press Ctrl+C to stop all services."
echo ""

docker-compose up
