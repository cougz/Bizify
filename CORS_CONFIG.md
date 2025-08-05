# CORS Configuration Guide

This document explains how to configure Cross-Origin Resource Sharing (CORS) for the Bizify application.

## Overview

CORS is a security feature implemented by web browsers that blocks requests from one domain to another unless the server explicitly allows them. This is crucial for the security of your application.

## Environment Variables

The following environment variables control CORS behavior:

### `CORS_ORIGINS`
**Default**: `http://localhost:3000`  
**Description**: Comma-separated list of allowed origins that can make requests to the API.

**Examples**:
```bash
# Development (local)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Production (specific domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Allow all origins (NOT recommended for production)
CORS_ORIGINS=*
```

### `CORS_METHODS`
**Default**: `GET,POST,PUT,DELETE,OPTIONS`  
**Description**: Comma-separated list of allowed HTTP methods.

**Examples**:
```bash
# Standard RESTful methods
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Read-only access
CORS_METHODS=GET,OPTIONS

# Allow all methods
CORS_METHODS=*
```

### `CORS_HEADERS`
**Default**: `Content-Type,Authorization`  
**Description**: Comma-separated list of allowed request headers.

**Examples**:
```bash
# Standard headers for API with authentication
CORS_HEADERS=Content-Type,Authorization

# Additional custom headers
CORS_HEADERS=Content-Type,Authorization,X-Custom-Header

# Allow all headers
CORS_HEADERS=*
```

### `CORS_CREDENTIALS`
**Default**: `true`  
**Description**: Whether to allow credentials (cookies, authorization headers) in CORS requests.

**Examples**:
```bash
# Allow credentials (required for authentication)
CORS_CREDENTIALS=true

# Disable credentials
CORS_CREDENTIALS=false
```

## Configuration Methods

### 1. Docker Compose with .env file

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your values
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
```

### 2. Direct Environment Variables

Set environment variables directly:

```bash
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
export CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS"
export CORS_HEADERS="Content-Type,Authorization"
export CORS_CREDENTIALS="true"

# Run Docker Compose
docker-compose up -d
```

### 3. Docker Compose Override

You can override the values in `compose.yaml` by setting environment variables:

```bash
CORS_ORIGINS="https://yourdomain.com" docker-compose up -d
```

## Security Considerations

### Development vs Production

**Development**:
```bash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true
```

**Production**:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true
```

### Best Practices

1. **Never use `*` for origins in production** - Always specify exact domains
2. **Be specific with methods** - Only allow the HTTP methods your app needs
3. **Limit headers** - Only allow necessary headers
4. **Use HTTPS in production** - Always use `https://` origins for production
5. **Test thoroughly** - Verify CORS works correctly after configuration changes

### Common Configurations

**Single Domain Production**:
```bash
CORS_ORIGINS=https://yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
```

**Multiple Subdomains**:
```bash
CORS_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
```

**API-Only (No Authentication)**:
```bash
CORS_ORIGINS=https://yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type
CORS_CREDENTIALS=false
```

## Troubleshooting

### Common CORS Errors

1. **"Access to fetch at '...' from origin '...' has been blocked by CORS policy"**
   - Solution: Add your frontend domain to `CORS_ORIGINS`

2. **"Preflight request doesn't pass access control check"**
   - Solution: Ensure `OPTIONS` is included in `CORS_METHODS`

3. **"Request header field authorization is not allowed"**
   - Solution: Add `Authorization` to `CORS_HEADERS`

### Testing CORS Configuration

You can test CORS configuration using curl:

```bash
# Test preflight request
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     http://localhost:8000/api/auth/me

# Test actual request
curl -H "Origin: https://yourdomain.com" \
     -H "Content-Type: application/json" \
     -X GET \
     http://localhost:8000/api/dashboard
```

### Debugging

The backend logs CORS configuration on startup:

```
CORS Configuration:
  Origins: ['https://yourdomain.com']
  Methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  Headers: ['Content-Type', 'Authorization']
  Credentials: True
```

Check these logs to verify your configuration is loaded correctly.

## Migration from Previous Configuration

If you're upgrading from the previous hardcoded CORS configuration:

1. The old configuration allowed all origins (`*`) - **this was insecure**
2. Update your deployment to use environment variables
3. Set specific origins for your production environment
4. Test thoroughly to ensure your frontend can still communicate with the backend

## Support

If you encounter CORS-related issues:

1. Check the browser's developer console for specific error messages
2. Verify the backend logs show the correct CORS configuration
3. Test with curl commands to isolate the issue
4. Ensure your frontend URL exactly matches the configured origins (including protocol and port)