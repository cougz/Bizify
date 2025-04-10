#!/bin/bash
# Script to run the entire Bizify application

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: Docker is not installed. Please install Docker to run the application in container mode."
  echo "Alternatively, you can run the application in development mode."
  echo ""
  echo "For development mode:"
  echo "  1. Start the frontend: cd client && npm start"
  echo "  2. Start the backend: cd server && source ../venv/bin/activate && python run.py"
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "Error: Docker Compose is not installed. Please install Docker Compose to run the application."
  exit 1
fi

# Parse command line arguments
DOCKER_MODE=true
DEV_MODE=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --dev) DEV_MODE=true; DOCKER_MODE=false ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

if [ "$DOCKER_MODE" = true ]; then
  echo "Starting Bizify application in Docker mode..."
  echo "This will start the PostgreSQL database, backend API, and frontend services."
  echo "Press Ctrl+C to stop all services."
  echo ""
  
  # Set environment variable for Docker mode
  export DOCKER_ENV=true
  
  # Run Docker Compose
  docker-compose up
elif [ "$DEV_MODE" = true ]; then
  echo "Starting Bizify application in development mode..."
  
  # Check if virtual environment exists
  if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found. Please run ./setup.sh first."
    exit 1
  fi
  
  # Start backend in background
  echo "Starting backend server..."
  cd server
  source ../venv/bin/activate
  python run.py &
  BACKEND_PID=$!
  cd ..
  
  # Start frontend
  echo "Starting frontend server..."
  cd client
  npm start &
  FRONTEND_PID=$!
  cd ..
  
  # Handle termination
  function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
  }
  
  trap cleanup SIGINT
  
  # Wait for processes
  wait $BACKEND_PID $FRONTEND_PID
else
  echo "Error: No mode specified. Use --dev for development mode or no flag for Docker mode."
  exit 1
fi
