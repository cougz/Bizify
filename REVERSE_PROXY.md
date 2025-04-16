# Deploying Bizify Behind a Reverse Proxy

This document explains how to configure Bizify to work correctly when deployed behind a reverse proxy such as Nginx, Apache, or Traefik.

## Overview

Bizify has been updated to support deployment behind a reverse proxy. The following changes have been made:

1. Runtime configuration for the frontend
2. Configurable API URL and base path
3. Environment variable support in the Nginx configuration
4. Updated Docker configuration

## Configuration Options

### Environment Variables

When deploying with Docker, you can configure the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NGINX_SERVER_NAME` | Server name for Nginx | `localhost` |
| `BACKEND_URL` | URL of the backend service | `http://backend:8000` |
| `CORS_ALLOW_ORIGIN` | CORS allowed origins | `*` |
| `API_URL` | API URL for the frontend | `/api` |
| `BASE_PATH` | Base path for the frontend (useful for subdirectory deployment) | `/` |
| `FRONTEND_PORT` | Port to expose the frontend on | `3000` |

### Example: Deploying to a Subdirectory

If you want to deploy Bizify to a subdirectory (e.g., `https://example.com/bizify`), set the following environment variables:

```bash
BASE_PATH=/bizify
```

### Example: Custom Backend URL

If your backend is hosted at a different URL:

```bash
BACKEND_URL=https://api.example.com
API_URL=https://api.example.com/api
```

## Nginx Reverse Proxy Example

Here's an example Nginx configuration for hosting Bizify behind a reverse proxy:

```nginx
server {
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Bizify frontend
    location /bizify/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Bizify API
    location /bizify/api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker Compose Example

Here's an example docker-compose override file for deploying behind a reverse proxy:

```yaml
# docker-compose.override.yml
services:
  frontend:
    environment:
      - NGINX_SERVER_NAME=example.com
      - BACKEND_URL=http://backend:8000
      - API_URL=/bizify/api
      - BASE_PATH=/bizify
    ports:
      - "3000:80"

  backend:
    environment:
      - ALLOWED_HOSTS=example.com,localhost
```

## Kubernetes Configuration

If you're deploying to Kubernetes, you can set these environment variables in your deployment manifest:

```yaml
# k8s/deployment.yaml (excerpt)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bizify-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: bizify-frontend:latest
        env:
        - name: NGINX_SERVER_NAME
          value: "example.com"
        - name: BACKEND_URL
          value: "http://bizify-backend:8000"
        - name: API_URL
          value: "/bizify/api"
        - name: BASE_PATH
          value: "/bizify"
```

## Troubleshooting

### Common Issues

1. **404 errors on page refresh**: Ensure your reverse proxy is configured to forward all requests to the frontend's index.html file.

2. **API requests failing**: Check that the API_URL is correctly set and that the reverse proxy is properly forwarding API requests.

3. **CORS errors**: Ensure the CORS_ALLOW_ORIGIN is set correctly in the frontend configuration.

### Checking Configuration

You can verify the runtime configuration by opening the browser's developer console and checking:

```javascript
console.log(window.RUNTIME_CONFIG);
```

This should show the current API_URL and BASE_PATH values.
