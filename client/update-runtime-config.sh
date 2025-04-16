#!/bin/bash
# Script to update the runtime configuration for Bizify
# This script can be used in CI/CD pipelines or during deployment

set -e

# Default values
API_URL=${API_URL:-/api}
BASE_PATH=${BASE_PATH:-/}

# Path to the runtime config file
CONFIG_FILE="./build/runtime-config.js"

echo "Updating runtime configuration..."
echo "API_URL: $API_URL"
echo "BASE_PATH: $BASE_PATH"

# Check if the build directory exists
if [ ! -d "./build" ]; then
  echo "Error: Build directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if the runtime config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Runtime config file not found at $CONFIG_FILE"
  exit 1
fi

# Update the runtime configuration
sed -i "s|API_URL: '[^']*'|API_URL: '$API_URL'|g" $CONFIG_FILE
sed -i "s|BASE_PATH: '[^']*'|BASE_PATH: '$BASE_PATH'|g" $CONFIG_FILE

echo "Runtime configuration updated successfully."
echo "You can now deploy the application with the updated configuration."
