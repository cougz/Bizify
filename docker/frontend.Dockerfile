FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the client code
COPY client/ ./

# Build the React app
RUN npm run build

# Nginx stage
FROM nginx:alpine

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]