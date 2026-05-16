# Docker Setup Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### 1. Build the Docker Image

```bash
# Build the backend image
docker build -t nhan-dien-nhan-backend:latest ./agent

# Or build using docker-compose
docker-compose build
```

### 2. Run the Container

#### Option A: Using Docker Compose (Recommended)

```bash
# Start the backend service
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the service
docker-compose down
```

#### Option B: Using Docker Directly

```bash
# Run the container
docker run -p 8000:8000 \
  -e GOOGLE_API_KEY=your_key_here \
  --name nhan-dien-nhan-backend \
  nhan-dien-nhan-backend:latest

# Run with environment file
docker run -p 8000:8000 \
  --env-file .env \
  --name nhan-dien-nhan-backend \
  nhan-dien-nhan-backend:latest
```

### 3. Access the Application

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Invoke Endpoint**: POST http://localhost:8000/invoke

## Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```
GOOGLE_API_KEY=your_google_api_key_here
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0
```

## Common Commands

```bash
# Build with custom tag
docker build -t nhan-dien-nhan-backend:v1.0 ./agent

# View running containers
docker ps

# View all images
docker images

# Remove image
docker rmi nhan-dien-nhan-backend:latest

# Push to Docker Hub (if needed)
docker tag nhan-dien-nhan-backend:latest username/nhan-dien-nhan-backend:latest
docker push username/nhan-dien-nhan-backend:latest

# Build specific service from docker-compose
docker-compose build backend

# Rebuild without cache
docker-compose build --no-cache backend

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

## Development Tips

### Enable Hot Reload

Uncomment the volumes section in `docker-compose.yml`:

```yaml
volumes:
  - ./agent:/app
  - /app/__pycache__
```

Then run:

```bash
docker-compose up -d
```

### View Container Logs

```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Logs from specific time
docker-compose logs --since 10m backend
```

### Execute Commands Inside Container

```bash
# Interactive shell
docker-compose exec backend /bin/bash

# Run a specific command
docker-compose exec backend pip list

# Run Python code
docker-compose exec backend python -c "import fastapi; print(fastapi.__version__)"
```

### Debug Issues

```bash
# Check container status
docker-compose ps

# Inspect container
docker inspect container_name

# Check resource usage
docker stats

# View startup logs
docker-compose logs backend
```

## Production Deployment

For production, consider:

1. **Use specific Python version tags** (not just `slim`)
2. **Enable resource limits** in docker-compose.yml
3. **Use secrets management** instead of .env files
4. **Set up proper logging**
5. **Use a reverse proxy** (nginx) in front
6. **Enable rate limiting**
7. **Use health checks** (already configured)

Example production docker-compose:

```yaml
services:
  backend:
    build:
      context: ./agent
      dockerfile: Dockerfile
    restart: always
    environment:
      - PYTHONUNBUFFERED=1
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
netstat -tulpn | grep :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Change port in docker-compose.yml
# Change "8000:8000" to "8001:8000"
```

### Memory Issues

```bash
# Check container memory usage
docker stats

# Increase Docker Desktop memory allocation via settings
```

### Build Fails

```bash
# Clear cache and rebuild
docker-compose build --no-cache backend

# Check logs for specific errors
docker-compose build backend 2>&1 | tail -50
```

### CORS Issues

The CORS settings are in `agent/server.py`. Update the `allow_origins` list as needed.

## Cleanup

```bash
# Stop all containers
docker-compose down

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup (careful!)
docker system prune -a
```
