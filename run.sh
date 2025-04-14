#!/bin/bash
# Script to run the Bizify application

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: Docker is not installed. Please install Docker to continue."
  echo "Visit https://docs.docker.com/get-docker/ for installation instructions."
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "Error: Docker Compose is not installed. Please install Docker Compose to continue."
  echo "Visit https://docs.docker.com/compose/install/ for installation instructions."
  exit 1
fi

# Parse command line arguments
BUILD_FLAG=""
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --build) BUILD_FLAG="--build" ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

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

# Run Docker Compose
if [ -n "$BUILD_FLAG" ]; then
  echo "Building containers..."
  docker compose up --build
else
  docker compose up
fi
