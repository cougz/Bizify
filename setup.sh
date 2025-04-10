#!/bin/bash
# Script to set up the entire Bizify application

echo "Setting up Bizify application..."

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

# Create necessary directories if they don't exist
echo "Creating necessary directories..."
mkdir -p client/src/components
mkdir -p client/src/pages
mkdir -p client/src/contexts
mkdir -p client/src/layouts
mkdir -p client/src/utils
mkdir -p client/src/assets
mkdir -p client/public
mkdir -p server/app/templates
mkdir -p server/migrations
mkdir -p docker
mkdir -p k8s

echo "Setup completed successfully!"
echo ""
echo "To start the application, run:"
echo "  ./run.sh"
echo ""
echo "This will start the PostgreSQL database, backend API, and frontend services."
echo "The application will be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
