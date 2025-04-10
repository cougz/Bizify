# Development stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including WeasyPrint dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    bash \
    # WeasyPrint dependencies
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libfribidi0 \
    libglib2.0-0 \
    libpangocairo-1.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY server/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV DOCKER_ENV=true

# Create necessary directories
RUN mkdir -p /app/app/templates

# Expose port
EXPOSE 8000

# The actual code will be mounted as a volume in development mode
# This allows for hot-reloading of code changes

# Command will be provided by docker-compose.yml
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
