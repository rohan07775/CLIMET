# Deployment Guide: AI-Powered Digital Twin of India's Climate

**Version:** 1.0 | **Last Updated:** June 2026 | **Maintainer:** Climate Twin India Team

---

## Table of Contents

1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Docker Compose Deployment (Primary Method)](#2-docker-compose-deployment-primary-method)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Initialization & Seeding](#4-database-initialization--seeding)
5. [ML Model Training](#5-ml-model-training)
6. [Local Development Setup (No Docker)](#6-local-development-setup-no-docker)
7. [Production Considerations](#7-production-considerations)
8. [Health Check Verification](#8-health-check-verification)
9. [Troubleshooting Common Issues](#9-troubleshooting-common-issues)
10. [Monitoring & Observability](#10-monitoring--observability)

---

## 1. Prerequisites & System Requirements

### Minimum Hardware

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 20 GB | 50 GB |
| Network | 10 Mbps | 100 Mbps |

> **Note:** The LSTM model training requires a GPU (NVIDIA with CUDA 11.8+). For local demo without training, pre-trained models are included and no GPU is needed.

### Software Requirements

```bash
# Verify Docker installation
docker --version        # Must be 24.0+
docker compose version  # Must be 2.20+

# Verify Git
git --version           # Must be 2.40+

# For manual setup (non-Docker)
python3 --version       # Must be 3.11+
node --version          # Must be 20+
psql --version          # PostgreSQL 15+
redis-server --version  # Redis 7+
```

### API Keys Required

Before deployment, obtain the following API keys:

| Service | Signup URL | Free Tier | Used For |
|---------|-----------|-----------|----------|
| **Google AI Studio** | [aistudio.google.com](https://aistudio.google.com) | 60 RPM | Gemini chatbot |
| **Open-Meteo** | [open-meteo.com](https://open-meteo.com) | 10,000/day | Weather data |
| **Mapbox** | [account.mapbox.com](https://account.mapbox.com) | 50,000 loads/mo | Map tiles |
| **Twilio** | [twilio.com/try-twilio](https://twilio.com/try-twilio) | $15 credit | SMS alerts |
| **NASA Earthdata** | [urs.earthdata.nasa.gov](https://urs.earthdata.nasa.gov) | Free | MODIS/GRACE |

> IMD and CPCB API keys require official registration with Government of India portals. Placeholder data is used for demonstration without these keys.

---

## 2. Docker Compose Deployment (Primary Method)

This is the **recommended and fastest** way to get the entire stack running.

### Step 1: Clone the Repository

```bash
git clone https://github.com/climate-twin-india/climate-twin-india.git
cd climate-twin-india
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open and edit the file — fill in at minimum:
# GEMINI_API_KEY, MAPBOX_ACCESS_TOKEN
# (other APIs will fall back to mock data for demo)
nano .env
```

### Step 3: Build Docker Images

```bash
# Build all images (first run takes 5-10 minutes)
docker compose build

# Or build a specific service
docker compose build backend
docker compose build frontend
```

### Step 4: Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# Watch startup logs to confirm all services are healthy
docker compose logs -f

# Check service status
docker compose ps
```

Expected healthy output:
```
NAME                    STATUS          PORTS
climate-twin-postgres   Up (healthy)    5432/tcp
climate-twin-redis      Up (healthy)    6379/tcp
climate-twin-backend    Up (healthy)    0.0.0.0:8000->8000/tcp
climate-twin-frontend   Up              0.0.0.0:3000->3000/tcp
```

### Step 5: Initialize the Database

```bash
# Run database initialization (creates tables, loads shapefiles, seeds base data)
docker compose exec backend python -m app.db.init_db

# Expected output:
# ✓ Creating tables...
# ✓ Loading India district boundaries (726 districts)...
# ✓ Loading India state boundaries (36 states)...
# ✓ Seeding historical climate data (1951-2020)...
# ✓ Loading ICAR crop calendar...
# ✓ Database initialization complete!
```

### Step 6: Trigger Initial Data Ingestion

```bash
# Fetch current weather data for all districts
docker compose exec backend celery -A app.celery_app call app.tasks.ingest_weather

# Fetch AQI data for all cities
docker compose exec backend celery -A app.celery_app call app.tasks.ingest_aqi

# Or trigger all ingestion tasks at once
docker compose exec backend python -m app.tasks.run_all_ingestion
```

### Step 7: Verify Deployment

```bash
# Check API health
curl http://localhost:8000/health
# Expected: {"status": "healthy", "database": "connected", "redis": "connected"}

# Check frontend loads
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

Open your browser:
- **Application:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **API Redoc:** http://localhost:8000/redoc

---

## 3. Environment Configuration

### Generating Secure Keys

```bash
# Generate a secure SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using openssl
openssl rand -hex 32
```

### Environment Variable Reference

**Database:**
```bash
POSTGRES_USER=climateuser              # PostgreSQL username
POSTGRES_PASSWORD=your-secure-password # PostgreSQL password (use strong password)
POSTGRES_DB=climate_twin_db            # Database name
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

**Redis:**
```bash
REDIS_URL=redis://redis:6379/0         # Main Redis database
CELERY_BROKER_URL=redis://redis:6379/1 # Celery message broker
CELERY_RESULT_BACKEND=redis://redis:6379/2 # Celery results
```

**Security:**
```bash
SECRET_KEY=your-32-char-secret-here    # JWT signing key — NEVER commit this
ALGORITHM=HS256                        # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=1440       # 24 hours
```

**API Keys:**
```bash
GEMINI_API_KEY=AIza...                 # Google AI Studio
OPEN_METEO_API_KEY=your-key           # Open-Meteo Pro (or leave blank for free tier)
IMD_API_KEY=your-key                   # IMD (Government registration required)
MAPBOX_ACCESS_TOKEN=pk.eyJ...          # Mapbox GL JS
TWILIO_ACCOUNT_SID=ACxxxxxxx           # Twilio (for SMS alerts)
TWILIO_AUTH_TOKEN=your-token
TWILIO_FROM_NUMBER=+1415xxxxxxx
CPCB_API_KEY=your-key                  # CPCB AQI data
NASA_EARTHDATA_TOKEN=your-token        # NASA Earthdata
```

**Application:**
```bash
CORS_ORIGINS=http://localhost:3000     # Comma-separated allowed origins
LOG_LEVEL=INFO                         # DEBUG | INFO | WARNING | ERROR
DATA_REFRESH_INTERVAL=900              # Seconds between data refreshes (900 = 15 min)
NEXT_PUBLIC_API_URL=http://localhost:8000 # Frontend API URL
```

### Multi-Environment Configuration

```bash
# Development (default)
cp .env.example .env

# Staging
cp .env.example .env.staging
# Edit .env.staging with staging API keys and URLs
docker compose --env-file .env.staging up -d

# Production
cp .env.example .env.production
# Edit .env.production
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 4. Database Initialization & Seeding

### Full Initialization (First Run)

```bash
# Full init: creates schema + loads all seed data
docker compose exec backend python -m app.db.init_db --full

# Flags available:
# --schema-only    : Create tables only, no data
# --seed-only      : Load seed data (assumes schema exists)
# --districts-only : Load only district boundaries
# --drop-create    : Drop and recreate all tables (WARNING: deletes all data)
```

### Database Migrations (Alembic)

```bash
# Apply pending migrations
docker compose exec backend alembic upgrade head

# Check migration status
docker compose exec backend alembic current

# Generate a new migration after model changes
docker compose exec backend alembic revision --autogenerate -m "add cyclone tracks table"

# Rollback last migration
docker compose exec backend alembic downgrade -1
```

### Database Backup & Restore

```bash
# Backup PostgreSQL database
docker compose exec postgres pg_dump -U climateuser climate_twin_db > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20260625.sql | docker compose exec -T postgres psql -U climateuser climate_twin_db

# Create compressed backup
docker compose exec postgres pg_dump -U climateuser climate_twin_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

---

## 5. ML Model Training

### Using Pre-Trained Models (Recommended for Demo)

The repository includes pre-trained model artifacts in `backend/app/ml/models/`:
- `xgboost_temperature_v2.pkl`
- `xgboost_rainfall_v2.pkl`
- `random_forest_disaster_v2.pkl`
- `lstm_7day_v2.h5`
- `prophet_monsoon_v2.pkl`

No training is required to run the demo. The system loads these automatically on startup.

### Retraining Models

```bash
# Train all models (uses historical data from database)
docker compose exec backend python -m app.ml.train --all

# Train individual models
docker compose exec backend python -m app.ml.train --model xgboost
docker compose exec backend python -m app.ml.train --model random_forest
docker compose exec backend python -m app.ml.train --model lstm
docker compose exec backend python -m app.ml.train --model prophet

# Training with GPU (if available)
docker compose exec backend python -m app.ml.train --all --use-gpu

# Monitor training progress
docker compose exec backend python -m app.ml.train --all --verbose
```

### Training Parameters

```bash
# Custom training parameters
docker compose exec backend python -m app.ml.train \
  --model xgboost \
  --train-years 1951-2022 \
  --val-years 2023 \
  --test-years 2024 \
  --output-dir /app/ml/models/custom/ \
  --n-trials 100
```

### Scheduled Retraining

The Celery beat scheduler triggers weekly retraining automatically:

```bash
# Start Celery beat scheduler (handles periodic tasks)
docker compose exec backend celery -A app.celery_app beat --loglevel=info

# Check scheduled task status
docker compose exec backend celery -A app.celery_app inspect scheduled
```

---

## 6. Local Development Setup (No Docker)

### Backend Development

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Black, isort, pytest, etc.

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@15

# Start Redis
brew services start redis

# Create database
createdb climate_twin_db

# Install PostGIS extension
psql climate_twin_db -c "CREATE EXTENSION postgis;"

# Set environment variables
export $(cat ../.env | xargs)
export DATABASE_URL="postgresql+asyncpg://$(whoami):@localhost:5432/climate_twin_db"

# Initialize database
python -m app.db.init_db

# Start Celery worker (new terminal)
celery -A app.celery_app worker --loglevel=debug --concurrency=2

# Start FastAPI with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Create local env file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_ACCESS_TOKEN}
EOF

# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
npm run start
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Run specific test file
pytest tests/test_forecasts.py -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=term-missing

# Frontend tests
cd frontend
npm run test
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

---

## 7. Production Considerations

### SSL/TLS with Nginx

For production deployment, add an Nginx reverse proxy with SSL:

```nginx
# /etc/nginx/conf.d/climate-twin.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### Production Environment Variables

```bash
# Additional production settings
DEBUG=false
LOG_LEVEL=WARNING
CORS_ORIGINS=https://your-domain.com
DATABASE_URL=postgresql+asyncpg://user:password@prod-db-host:5432/climate_twin_db
REDIS_URL=redis://prod-redis-host:6379/0

# Connection pool settings
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30

# Rate limiting
RATE_LIMIT_PER_MINUTE=60    # For anonymous users in production
```

### Resource Limits in Docker Compose

For production, add resource limits to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Database Optimization

```sql
-- Essential indexes for performance
CREATE INDEX CONCURRENTLY idx_climate_readings_district_time 
  ON climate_readings(district_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_disaster_alerts_active 
  ON disaster_alerts(issued_at DESC) 
  WHERE valid_until > NOW();

CREATE INDEX CONCURRENTLY idx_forecasts_district_valid 
  ON forecasts(district_id, valid_time) 
  WHERE valid_time > NOW();

-- Enable PostGIS spatial index on districts
CREATE INDEX idx_districts_geom ON districts USING GIST(geom);
```

### Scaling the Backend

```bash
# Scale to 3 backend instances behind a load balancer
docker compose up -d --scale backend=3

# Scale Celery workers
docker compose up -d --scale celery-worker=5
```

---

## 8. Health Check Verification

### Automated Health Checks

```bash
# Run the full health check script
./scripts/healthcheck.sh

# Or run manually:

# 1. Check API
curl -s http://localhost:8000/health | python3 -m json.tool

# 2. Check database connectivity
docker compose exec backend python3 -c "
from app.db.base import engine
import asyncio
async def check():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT COUNT(*) FROM districts')
        count = result.scalar()
        print(f'Districts in database: {count}')
asyncio.run(check())
"

# 3. Check Redis
docker compose exec redis redis-cli PING
# Expected: PONG

# 4. Check Celery workers
docker compose exec backend celery -A app.celery_app inspect ping
# Expected: {"celery@worker1": {"ok": "pong"}}

# 5. Check ML models loaded
curl -s http://localhost:8000/api/v1/forecast/district/1 | python3 -m json.tool
# Expected: forecast JSON with temperature and rainfall predictions

# 6. Check real-time data freshness
curl -s "http://localhost:8000/api/v1/climate/current?limit=1" | python3 -m json.tool
# Expected: timestamp within last 15 minutes

# 7. Check WebSocket
wscat -c ws://localhost:8000/ws/alerts
# Expected: connection established, receives active alert data

# 8. Check frontend
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

### Health Check Dashboard

Once running, a basic health dashboard is available at:
- `http://localhost:8000/health` — API health
- `http://localhost:8000/metrics` — Prometheus metrics (if enabled)

---

## 9. Troubleshooting Common Issues

### Issue 1: Docker Compose Build Fails

**Symptom:** `docker compose build` fails with dependency errors.

**Solutions:**
```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker compose build --no-cache

# Check Docker disk space
docker system df
docker system prune -f  # Remove unused resources
```

---

### Issue 2: Database Connection Refused

**Symptom:** Backend logs show `connection refused` to PostgreSQL.

**Solutions:**
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Common fix: wait for PostgreSQL to be fully ready
docker compose restart backend  # Backend retries connection on start

# Verify connection manually
docker compose exec postgres psql -U climateuser -d climate_twin_db -c "SELECT 1;"

# If PostGIS extension missing
docker compose exec postgres psql -U climateuser -d climate_twin_db \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

### Issue 3: Redis Connection Error

**Symptom:** `redis.exceptions.ConnectionError: Error 111 connecting to redis:6379`

**Solutions:**
```bash
# Check Redis service
docker compose ps redis
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli PING

# Restart Redis
docker compose restart redis
```

---

### Issue 4: Frontend Cannot Reach Backend (CORS Error)

**Symptom:** Browser console shows `CORS policy: No 'Access-Control-Allow-Origin'`.

**Solutions:**
```bash
# Check CORS_ORIGINS in .env
grep CORS_ORIGINS .env
# Must include your frontend URL: CORS_ORIGINS=http://localhost:3000

# Verify backend has the frontend URL in allowed origins
docker compose exec backend env | grep CORS

# Restart backend after updating .env
docker compose restart backend
```

---

### Issue 5: ML Models Not Found

**Symptom:** API returns `500 Internal Server Error` with "Model file not found".

**Solutions:**
```bash
# Check if model files exist
docker compose exec backend ls -la app/ml/models/

# If empty, run model initialization
docker compose exec backend python -m app.ml.init_models

# Or copy pre-trained models into container
docker cp backend/app/ml/models/ $(docker compose ps -q backend):/app/app/ml/models/
```

---

### Issue 6: Out of Memory Errors

**Symptom:** Container exits with code 137 (OOM killed).

**Solutions:**
```bash
# Check container memory usage
docker stats

# Increase Docker memory limit (Docker Desktop: Settings > Resources)

# Reduce ML batch size for inference
# In .env:
ML_BATCH_SIZE=32  # Default is 128

# Reduce celery concurrency
# In .env:
CELERY_CONCURRENCY=2  # Default is 4
```

---

### Issue 7: Celery Tasks Not Running

**Symptom:** Data is not being refreshed; tasks appear stuck.

**Solutions:**
```bash
# Check Celery worker status
docker compose exec backend celery -A app.celery_app inspect active

# Check task queue
docker compose exec redis redis-cli llen celery

# Restart Celery workers
docker compose restart celery-worker

# Purge stuck tasks (use with caution)
docker compose exec backend celery -A app.celery_app purge
```

---

### Issue 8: Port Already in Use

**Symptom:** `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solutions:**
```bash
# Find what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "8001:8000"  # Change host port to 8001
```

---

## 10. Monitoring & Observability

### Application Logs

```bash
# All services
docker compose logs -f

# Specific service, last 100 lines
docker compose logs --tail=100 -f backend

# Search for errors
docker compose logs backend 2>&1 | grep -i error

# Export logs
docker compose logs --no-color > deployment_logs_$(date +%Y%m%d).txt
```

### Metrics (Prometheus + Grafana)

If using the monitoring stack:

```bash
# Start monitoring services
docker compose --profile monitoring up -d

# Grafana dashboard
open http://localhost:3001
# Default credentials: admin / climate_twin_2026

# Available dashboards:
# - API Performance (response times, error rates, throughput)
# - ML Model Metrics (prediction accuracy, inference latency)
# - Data Pipeline Health (ingestion task success/failure rates)
# - Database Performance (query times, connection pool)
```

### Key Metrics to Monitor

| Metric | Alert Threshold |
|--------|----------------|
| API p99 latency | > 2000ms |
| Error rate | > 1% |
| Data freshness | > 30 minutes old |
| Disk usage | > 80% |
| Memory usage | > 85% |
| Celery queue depth | > 100 tasks |
| DB connection pool | > 80% utilized |

---

*For additional support, file an issue on GitHub or contact the team at climate-twin@hackathon2026.in*
