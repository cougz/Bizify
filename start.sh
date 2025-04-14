#!/bin/bash
# Script to run the Bizify application

echo "Starting Bizify application..."
echo "This will start the PostgreSQL database, backend API, and frontend services."
echo ""
echo "IMPORTANT: For first-time setup, you'll want to create a user:"
echo "1. Start the database service: docker compose up postgres -d"
echo "2. Run the user creation script: docker compose run backend python create_user.py"
echo "3. Stop the database: docker compose down"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Clean up any existing containers
docker compose down

# Remove any existing images to ensure a clean build
docker compose rm -f

# Remove any existing images
docker rmi bizify-frontend bizify-backend -f 2>/dev/null || true

# Build and start all services
docker compose up --build
