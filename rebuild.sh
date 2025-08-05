#!/bin/bash

# Docker Compose Rebuild Script
# This script rebuilds the stack while preserving data volumes for migration safety
# Usage: ./rebuild.sh [--reset-data]
#   --reset-data: Remove all volumes (destructive, use with caution)

set -e  # Exit on any error

RESET_DATA=false
if [[ "$1" == "--reset-data" ]]; then
    RESET_DATA=true
    echo "⚠️  WARNING: Data reset mode enabled - all volumes will be removed!"
    echo "🔄 Starting Docker Compose rebuild process (DESTRUCTIVE)..."
else
    echo "🔄 Starting Docker Compose rebuild process (data-safe)..."
    echo "💡 Tip: Use './rebuild.sh --reset-data' to reset all data volumes if needed"
fi

# Step 0: Pull latest changes from git in current directory
echo "📥 Pulling latest changes from git..."
git pull

# Step 1: Check if we're in the root directory with docker-compose files
if [ ! -f "compose.yaml" ]; then
    echo "❌ Error: compose.yaml not found in current directory"
    echo "📁 Make sure you're running this script from the project root"
    exit 1
fi

echo "📁 Using current directory (root) for Docker Compose operations..."

# Step 1: Bring down the Docker Compose stack
echo "📉 Bringing down Docker Compose stack..."
sudo docker compose down

# Step 2: Handle volumes based on mode
if [[ "$RESET_DATA" == "true" ]]; then
    echo "🗑️  Removing specific Docker volumes..."
    VOLUMES_TO_REMOVE=(
        "bizify_postgres_data"
    )

    for volume in "${VOLUMES_TO_REMOVE[@]}"; do
        if sudo docker volume ls -q | grep -q "^${volume}$"; then
            echo "Removing volume: $volume"
            sudo docker volume rm "$volume"
        else
            echo "Volume not found (skipping): $volume"
        fi
    done
    echo "✅ Volume removal completed"
else
    echo "📊 Current data volumes (preserved):"
    sudo docker volume ls | grep -E "(postgres_data)" || echo "No data volumes found"
    echo "🔒 Volumes will be preserved for safe migration"
fi

# Step 3: Build and start the stack
echo "🚀 Starting Docker Compose stack with fresh build..."
sudo docker compose up -d --build

if [[ "$RESET_DATA" == "true" ]]; then
    echo "✅ Docker Compose rebuild completed with data reset!"
    echo "⚠️  All data volumes were removed - this was a fresh start"
else
    echo "✅ Docker Compose rebuild completed with data preservation!"
    echo "🔒 All database and application data has been preserved for safe migration"
fi
echo "📊 Current running containers:"
sudo docker compose ps