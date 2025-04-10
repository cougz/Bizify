#!/bin/bash
# Script to set up the entire Bizify application

echo "Setting up Bizify application..."

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

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
pip install -r requirements.txt
cd ..

# Set up the database
echo "Setting up the database..."
cd server
python setup_db.py
cd ..

echo "Setup completed successfully!"
echo ""
echo "To start the application, run:"
echo "  ./run.sh"
echo ""
echo "For development:"
echo "  Frontend: cd client && npm start"
echo "  Backend: cd server && python run.py"
