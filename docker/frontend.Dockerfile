FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client code
COPY client/ ./

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:8000/api

# Expose port
EXPOSE 3000

# Start React development server
CMD ["npm", "start"]
