#!/bin/bash
# Script to run the Bizify application in production mode

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

echo "Starting Bizify application in PRODUCTION mode..."
echo "This will start the PostgreSQL database, backend API, and frontend services."
echo ""
echo "IMPORTANT: Before running in production for the first time, you should create a production user:"
echo "1. Start the database service: docker-compose -f docker-compose.prod.yml up postgres -d"
echo "2. Run the user creation script: docker-compose -f docker-compose.prod.yml run backend python create_production_user.py"
echo "3. Stop the database: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Run Docker Compose with production configuration
if [ -n "$BUILD_FLAG" ]; then
  echo "Building containers..."
  docker-compose -f docker-compose.prod.yml up --build
else
  docker-compose -f docker-compose.prod.yml up
fi
