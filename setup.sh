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

# Set up Python virtual environment
echo "Setting up Python virtual environment..."
if [ -x "$(command -v python3)" ]; then
    PYTHON_CMD="python3"
elif [ -x "$(command -v python)" ]; then
    PYTHON_CMD="python"
else
    echo "Error: Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment. Please install venv package."
        echo "On Ubuntu/Debian: sudo apt-get install python3-venv"
        echo "On CentOS/RHEL: sudo yum install python3-venv"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    echo "Error: Virtual environment activation script not found."
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
pip install -r requirements.txt
cd ..

# Set up the database
echo "Setting up the database..."
cd server
python setup_db.py
DB_SETUP_RESULT=$?
cd ..

echo "Setup completed!"
echo ""

if [ $DB_SETUP_RESULT -ne 0 ]; then
    echo "Note: Database setup encountered issues. This is expected if PostgreSQL is not configured."
    echo "You can run the application with Docker to use the containerized database:"
    echo "  ./run.sh"
    echo ""
    echo "Or for local development without Docker, you'll need to:"
    echo "1. Install PostgreSQL"
    echo "2. Create a database named 'bizify'"
    echo "3. Create a user 'bizify' with password 'bizify_password'"
    echo "4. Grant all privileges on database 'bizify' to user 'bizify'"
    echo "5. Run the database setup again: cd server && python setup_db.py"
else
    echo "To start the application, run:"
    echo "  ./run.sh"
    echo ""
    echo "For development:"
    echo "  Frontend: cd client && npm start"
    echo "  Backend: cd server && source ../venv/bin/activate && python run.py"
fi
