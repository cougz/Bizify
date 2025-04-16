# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client code
COPY client/ ./

# Set environment variables for build time
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/templates/default.conf.template

# Create a script to update runtime configuration at container startup
RUN echo '#!/bin/sh \n\
# Update runtime configuration with environment variables \n\
echo "Updating runtime configuration..." \n\
sed -i "s|API_URL: \x27/api\x27|API_URL: \x27${API_URL:-/api}\x27|g" /usr/share/nginx/html/runtime-config.js \n\
sed -i "s|BASE_PATH: \x27/\x27|BASE_PATH: \x27${BASE_PATH:-/}\x27|g" /usr/share/nginx/html/runtime-config.js \n\
echo "Runtime configuration updated." \n\
# Execute the main container command \n\
exec "$@"' > /docker-entrypoint.d/30-update-runtime-config.sh && \
chmod +x /docker-entrypoint.d/30-update-runtime-config.sh

# Set environment variables with defaults
ENV NGINX_SERVER_NAME=localhost
ENV BACKEND_URL=http://backend:8000
ENV CORS_ALLOW_ORIGIN=*
ENV API_URL=/api
ENV BASE_PATH=/

# Expose port
EXPOSE 80

# Nginx will start automatically via the default entrypoint
