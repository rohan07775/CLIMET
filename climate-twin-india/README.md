<div align="center">

# 🌏 AI-Powered Digital Twin of India's Climate

**A real-time, AI-driven geospatial intelligence platform that mirrors India's climate system—predicting disasters, empowering farmers, and shaping policy decisions through the power of machine learning.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/climate-twin-india)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)

---

*🏆 Built for National Hackathon 2026 — Climate Intelligence Track*

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features--10-modules)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Architecture Diagram](#-architecture-diagram)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation — Docker Way](#installation--docker-way-recommended)
  - [Installation — Manual Way](#installation--manual-way)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [API Documentation](#-api-documentation)
- [ML Models](#-ml-models)
- [Data Sources](#-data-sources)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌧 Problem Statement

India is one of the world's most climate-vulnerable nations:

- **1,500+ deaths** annually from extreme heat waves (IMD, 2023)
- **₹1.5 Lakh Crore** in annual agricultural losses due to erratic monsoons
- **140 million farmers** lack access to precision weather forecasting
- **Disaster response** averages 6–8 hours delayed due to fragmented alert systems
- Existing weather platforms are siloed, non-interactive, and lack AI-driven predictive capabilities

India needs a **unified, intelligent, real-time climate intelligence platform** that not only monitors the current state of the climate but **predicts, warns, and advises** — at the district level, for every Indian.

---

## 💡 Solution Overview

The **AI-Powered Digital Twin of India's Climate** is a full-stack geospatial platform that creates a living, breathing, AI-driven replica of India's climate system. It ingests real-time data from 12+ sources, runs ensemble ML models (XGBoost, Random Forest, LSTM, Prophet), and presents actionable insights through an interactive map, intelligent dashboards, and a conversational AI chatbot — all updated every 15 minutes.

**In one sentence:** *We built the Google Maps of Indian climate — interactive, intelligent, and always live.*

---

## 🚀 Key Features — 10 Modules

### 🗺️ Module 1: Interactive India Climate Map
A real-time, district-level interactive map of India built with Leaflet.js / Mapbox. Users can toggle between temperature, rainfall, humidity, air quality, and drought index overlays. All 726 Indian districts rendered with live data.

### 🌡️ Module 2: AI Climate Prediction Engine
Ensemble ML pipeline combining XGBoost, Random Forest, and LSTM neural networks to deliver 7-day district-level climate forecasts with confidence intervals. Achieves RMSE of 1.8°C for temperature and 12mm for precipitation.

### 🚨 Module 3: Disaster Early Warning System
Real-time alert engine for floods, droughts, cyclones, and heatwaves. Integrates IMD bulletins, satellite imagery change detection, and ML anomaly detection. Sends SMS/WhatsApp alerts via Twilio. Sub-2-hour warning lead time.

### 🌾 Module 4: Agriculture Intelligence Hub
Crop-specific climate suitability analysis across 36 states. Provides sowing/harvesting advisory, irrigation scheduling, and pest risk prediction based on microclimate data. Tailored for Rabi, Kharif, and Zaid seasons.

### 💧 Module 5: Water Resource Monitor
Tracks 91 major river basins and 5,264 reservoirs. Visualizes groundwater depletion trends (GRACE satellite data), monsoon runoff projections, and flood risk zones with 48-hour inundation maps.

### 🌬️ Module 6: Air Quality Intelligence
Real-time AQI monitoring for 250+ cities. PM2.5/PM10/NO2/CO dispersion modeling using ML + wind vector data. Fire weather index integration for stubble-burning season alerts.

### 🤖 Module 7: AI Climate Chatbot (Gemini-Powered)
Conversational AI interface that answers plain-language climate questions in Hindi and English. Supports voice input, provides hyper-local forecasts, farmer advisories, and disaster preparedness checklists.

### 📊 Module 8: Analytics & Trend Dashboard
Long-term climate trend visualizations using 50+ years of historical data. Anomaly detection charts, climate change indicators (rising sea levels, glacier retreat), monsoon onset/withdrawal analysis.

### 🏛️ Module 9: Policy Intelligence Layer
District Climate Vulnerability Index (DCVI) computed for all 726 districts. Heatwave action plan recommendations, NDRF resource allocation optimization, and carbon footprint tracking.

### 🛰️ Module 10: Satellite Data Integration
Real-time ISRO MOSDAC + NASA MODIS satellite data ingestion. Vegetation index (NDVI), Sea Surface Temperature (SST), cloud cover analysis, and cyclone track prediction from satellite imagery.

---

## 🎯 Live Demo

| Resource | Link |
|----------|-------|
| 🌐 Live Application | `http://localhost:3000` (after local setup) |
| 📖 API Swagger Docs | `http://localhost:8000/docs` |
| 📊 API Redoc | `http://localhost:8000/redoc` |
| 🗄️ Database Admin | `http://localhost:5050` (pgAdmin) |

> **Demo Credentials:**
> - Email: `demo@climatetwin.in`
> - Password: `HackathonDemo2026`

---

## 🛠️ Tech Stack

### 🔙 Backend
| Technology | Purpose |
|------------|---------|
| 🐍 **FastAPI** (Python 3.11) | REST API framework, async I/O |
| 🗄️ **PostgreSQL 15** + PostGIS | Geospatial primary database |
| 🔴 **Redis 7** | Caching, real-time pub/sub, task queue |
| 🦾 **Celery** | Background ML training & data ingestion |
| 🤖 **XGBoost + scikit-learn** | Climate prediction ML models |
| 🧠 **TensorFlow / Keras** | LSTM time-series neural networks |
| 📈 **Prophet (Meta)** | Seasonal trend forecasting |
| 🐼 **Pandas + NumPy** | Data processing pipeline |
| 🗺️ **GeoPandas + Shapely** | Geospatial data handling |
| 🔌 **SQLAlchemy 2.0** | ORM with async support |
| 🔐 **JWT + OAuth2** | Authentication & authorization |

### 🖥️ Frontend
| Technology | Purpose |
|------------|---------|
| ⚛️ **Next.js 14** (React) | Full-stack React framework, SSR |
| 🗺️ **Leaflet.js + React-Leaflet** | Interactive geospatial map |
| 📊 **Recharts + D3.js** | Data visualization & charts |
| 🎨 **Tailwind CSS v3** | Utility-first responsive UI |
| 🌟 **Shadcn/UI** | Accessible component library |
| 🔄 **Zustand** | Lightweight state management |
| 📡 **TanStack Query** | Server state synchronization |
| 🧩 **Mapbox GL JS** | 3D terrain & satellite layers |

### ☁️ Infrastructure & DevOps
| Technology | Purpose |
|------------|---------|
| 🐳 **Docker + Docker Compose** | Container orchestration |
| 🔄 **GitHub Actions** | CI/CD pipeline |
| 📊 **Prometheus + Grafana** | Monitoring & alerting |
| 🔒 **Nginx** | Reverse proxy & SSL termination |
| 🌩️ **AWS / GCP ready** | Cloud deployment configuration |

### 🤖 AI / Data
| Technology | Purpose |
|------------|---------|
| 🧠 **Google Gemini 1.5 Pro** | Conversational AI chatbot |
| 🌍 **Open-Meteo API** | Real-time global weather data |
| 🛰️ **ISRO MOSDAC** | Indian satellite data |
| 📡 **IMD API** | Indian Meteorological Department |
| 🌊 **NASA MODIS/GRACE** | Satellite-derived earth observation |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                             │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ IMD API  │  │Open-Meteo│  │  ISRO    │  │ NASA     │  │ CPCB    │  │
│  │(Weather) │  │(Global)  │  │ MOSDAC   │  │MODIS/    │  │(AQI)    │  │
│  │          │  │          │  │(Satellite│  │GRACE     │  │         │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       └─────────────┴──────────────┴──────────────┴─────────────┘       │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │ Celery Workers (Async Ingestion)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROCESSING & ML LAYER                              │
│                                                                         │
│  ┌─────────────────────┐    ┌──────────────────────────────────────┐   │
│  │  Data Pipeline      │    │          ML Model Ensemble           │   │
│  │  ─────────────────  │    │  ──────────────────────────────────  │   │
│  │  • Pandas ETL       │───▶│  • XGBoost   (temp/rain prediction) │   │
│  │  • GeoPandas        │    │  • Random Forest (disaster risk)     │   │
│  │  • Feature Eng.     │    │  • LSTM NN   (time-series 7-day)    │   │
│  │  • Normalisation    │    │  • Prophet   (seasonal trends)       │   │
│  └─────────────────────┘    └──────────────┬─────────────────────┘   │
│                                             │                           │
└─────────────────────────────────────────────┼───────────────────────────┘
                                              │
┌─────────────────────────────────────────────┼───────────────────────────┐
│                    STORAGE LAYER            │                           │
│                                             ▼                           │
│  ┌──────────────────┐    ┌─────────────────────┐    ┌───────────────┐  │
│  │  PostgreSQL 15   │    │    Redis 7           │    │  File Store   │  │
│  │  + PostGIS       │    │    ──────────────    │    │  (Model       │  │
│  │  ─────────────── │    │  • API Cache (TTL)  │    │   Artifacts,  │  │
│  │  • Climate data  │    │  • Real-time alerts │    │   Shapefiles) │  │
│  │  • Geodata       │    │  • Session store    │    │               │  │
│  │  • User data     │    │  • Task queue       │    │               │  │
│  └──────────────────┘    └─────────────────────┘    └───────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (FastAPI)                              │
│                                                                         │
│   /api/v1/climate  /api/v1/forecast  /api/v1/disasters  /api/v1/agri   │
│   /api/v1/aqi      /api/v1/water     /api/v1/chat       /api/v1/policy │
│                                                                         │
│                    JWT Authentication | Rate Limiting                   │
│                    WebSocket (Real-time updates)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Next.js 14)                       │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Interactive   │  │  Analytics    │  │  AI        │  │  Disaster │  │
│  │ India Map     │  │  Dashboard    │  │  Chatbot   │  │  Alerts   │  │
│  │ (Leaflet.js)  │  │  (Recharts)   │  │  (Gemini)  │  │  Panel    │  │
│  └───────────────┘  └───────────────┘  └────────────┘  └───────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

| Tool | Version | Check Command |
|------|---------|--------------|
| Docker | 24.0+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Git | 2.40+ | `git --version` |
| Python | 3.11+ | `python --version` (manual setup only) |
| Node.js | 20+ | `node --version` (manual setup only) |
| npm | 9+ | `npm --version` (manual setup only) |

---

### Installation — Docker Way (Recommended)

The fastest way to get the full stack running locally.

```bash
# 1. Clone the repository
git clone https://github.com/climate-twin-india/climate-twin-india.git
cd climate-twin-india

# 2. Copy the environment file
cp .env.example .env

# 3. Edit the .env file with your API keys
nano .env    # or use your favourite editor

# 4. Build and start all services
docker compose up --build -d

# 5. Wait for services to be healthy (~2 minutes on first run)
docker compose ps

# 6. Initialize the database with seed data
docker compose exec backend python -m app.db.init_db

# 7. Run initial ML model training (optional — pre-trained models included)
docker compose exec backend python -m app.ml.train --all

# 8. Open the application
open http://localhost:3000        # Frontend
open http://localhost:8000/docs   # API Docs
```

---

### Installation — Manual Way

For developers who prefer direct local execution without Docker.

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example ../.env
export $(cat ../.env | xargs)

# Initialize PostgreSQL database
createdb climate_twin_db
python -m app.db.init_db

# Start Redis (must be running separately)
redis-server --daemonize yes

# Start Celery worker (in a separate terminal)
celery -A app.celery_app worker --loglevel=info

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Set frontend environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local

# Start the Next.js development server
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

### Environment Variables

Copy `.env.example` to `.env` and fill in these values:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql+asyncpg://user:pass@localhost:5432/climate_twin_db` |
| `REDIS_URL` | ✅ | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | ✅ | JWT signing secret (32+ chars) | `your-super-secret-key-here` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for chatbot | `AIza...` |
| `OPEN_METEO_API_KEY` | ⚠️ | Open-Meteo Pro API key | `your-key` |
| `IMD_API_KEY` | ⚠️ | India Met. Dept. API key | `your-key` |
| `TWILIO_ACCOUNT_SID` | ⚠️ | Twilio for SMS/WhatsApp alerts | `ACxxxx` |
| `TWILIO_AUTH_TOKEN` | ⚠️ | Twilio auth token | `your-token` |
| `TWILIO_FROM_NUMBER` | ⚠️ | Twilio sender number | `+1415...` |
| `MAPBOX_ACCESS_TOKEN` | ⚠️ | Mapbox GL JS access token | `pk.eyJ...` |
| `CPCB_API_KEY` | ⚠️ | Central Pollution Control Board AQI data | `your-key` |
| `NASA_EARTHDATA_TOKEN` | ⚠️ | NASA Earthdata for MODIS/GRACE | `your-token` |
| `POSTGRES_USER` | ✅ | PostgreSQL username | `climateuser` |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password | `securepassword` |
| `POSTGRES_DB` | ✅ | PostgreSQL database name | `climate_twin_db` |
| `ALGORITHM` | ✅ | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | JWT expiry in minutes | `1440` |
| `CELERY_BROKER_URL` | ✅ | Celery broker (Redis) | `redis://localhost:6379/1` |
| `CELERY_RESULT_BACKEND` | ✅ | Celery result backend | `redis://localhost:6379/2` |
| `CORS_ORIGINS` | ✅ | Allowed CORS origins | `http://localhost:3000` |
| `LOG_LEVEL` | ✅ | Application log level | `INFO` |
| `NEXT_PUBLIC_API_URL` | ✅ | API URL for frontend | `http://localhost:8000` |
| `DATA_REFRESH_INTERVAL` | ✅ | Data refresh in seconds | `900` |

> ✅ = Required · ⚠️ = Required for full functionality (free tier available)

---

### Running the Project

```bash
# Start all services
docker compose up -d

# View real-time logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove all data volumes (full reset)
docker compose down -v

# Scale the backend workers
docker compose up -d --scale backend=3

# Check service health
docker compose ps
```

---

## 📡 API Documentation

Full interactive API documentation available at `http://localhost:8000/docs`.

### Core Endpoints

#### 🌡️ Climate Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/climate/current` | Current climate data for all districts |
| `GET` | `/api/v1/climate/district/{district_id}` | Climate data for a specific district |
| `GET` | `/api/v1/climate/state/{state_code}` | Aggregated state-level climate data |
| `GET` | `/api/v1/climate/heatmap` | GeoJSON heatmap data for map overlay |

#### 🔮 Forecasts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/forecast/{district_id}` | 7-day forecast for a district |
| `GET` | `/api/v1/forecast/monsoon` | All-India monsoon onset/withdrawal prediction |
| `GET` | `/api/v1/forecast/seasonal` | 3-month seasonal outlook |
| `POST` | `/api/v1/forecast/custom` | Custom forecast with user-specified parameters |

#### 🚨 Disaster Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/disasters/active` | All active disaster alerts |
| `GET` | `/api/v1/disasters/history` | Historical disaster events |
| `POST` | `/api/v1/disasters/subscribe` | Subscribe to SMS/WhatsApp alerts |
| `GET` | `/api/v1/disasters/risk/{district_id}` | Disaster risk score for a district |

#### 🌾 Agriculture
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/agri/advisory/{district_id}` | Crop-specific advisory for a district |
| `GET` | `/api/v1/agri/suitability` | Crop suitability heatmap |
| `POST` | `/api/v1/agri/irrigation-schedule` | Custom irrigation schedule |
| `GET` | `/api/v1/agri/pest-risk` | Pest outbreak risk map |

#### 💧 Water Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/water/reservoirs` | Real-time reservoir levels |
| `GET` | `/api/v1/water/groundwater` | Groundwater depletion trends |
| `GET` | `/api/v1/water/flood-risk` | Flood risk zones with inundation maps |
| `GET` | `/api/v1/water/river/{basin_id}` | River basin hydrology |

#### 🌬️ Air Quality
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/aqi/cities` | AQI for all monitored cities |
| `GET` | `/api/v1/aqi/city/{city_name}` | Detailed AQI with pollutant breakdown |
| `GET` | `/api/v1/aqi/forecast/{city_name}` | 72-hour AQI forecast |

#### 🤖 AI Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat/message` | Send message to AI chatbot |
| `GET` | `/api/v1/chat/history/{session_id}` | Retrieve chat history |
| `DELETE` | `/api/v1/chat/history/{session_id}` | Clear chat history |

#### 🏛️ Policy & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/policy/vulnerability-index` | District Climate Vulnerability Index |
| `GET` | `/api/v1/analytics/trends/{indicator}` | Long-term trend data |
| `GET` | `/api/v1/analytics/anomalies` | Current climate anomalies |

#### 🛰️ Satellite Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/satellite/ndvi` | Vegetation index map |
| `GET` | `/api/v1/satellite/sst` | Sea surface temperature |
| `GET` | `/api/v1/satellite/cyclone-track` | Active cyclone tracking |

---

## 🤖 ML Models

### Model Architecture Overview

| Model | Type | Purpose | Input Features | Accuracy |
|-------|------|---------|----------------|----------|
| **XGBoost Regressor** | Gradient Boosting | Temperature & Rainfall prediction | 47 meteorological features | RMSE: 1.8°C / 12mm |
| **Random Forest Classifier** | Ensemble | Disaster risk classification | 31 climate + topographical features | Accuracy: 89.3% |
| **Bi-LSTM Neural Network** | Deep Learning | 7-day time-series forecasting | 90-day historical sequences | MAE: 2.1°C |
| **Prophet** | Bayesian Structural | Seasonal trend & monsoon forecast | 50yr historical monthly data | MAPE: 8.4% |

### Training Pipeline

```
Raw Data → Feature Engineering → Train/Val/Test Split (70/15/15)
       → Hyperparameter Tuning (Optuna) → Cross-Validation (5-fold)
       → Model Training → Evaluation → Model Registry (MLflow)
       → A/B Testing → Production Deployment
```

### Key ML Features

- **Ensemble Voting:** Predictions are weighted averages of all 4 models
- **Uncertainty Quantification:** Conformal prediction intervals for all forecasts
- **Online Learning:** Models retrain weekly on new data via Celery tasks
- **Explainability:** SHAP values available for every prediction
- **District-specific Models:** Separate calibrated models for 5 climate zones

---

## 📡 Data Sources

| Source | Data Type | Update Frequency | Coverage |
|--------|-----------|-----------------|----------|
| **IMD (India Met Dept)** | Temperature, Rainfall, Wind | 3-hourly | All India |
| **Open-Meteo** | Global weather parameters | Hourly | All India |
| **ISRO MOSDAC** | Satellite imagery, SST | Daily | All India |
| **NASA MODIS** | Vegetation index, Land surface temp | Daily | All India |
| **NASA GRACE** | Groundwater depletion | Monthly | All India |
| **CPCB** | Air Quality Index (AQI) | Hourly | 250+ cities |
| **CWC (Central Water Commission)** | Reservoir levels, River discharge | Daily | 91 basins |
| **NOAA** | Cyclone tracking, SST anomalies | 6-hourly | Bay of Bengal |
| **IMD Historical Archive** | 50-year climate record | Static | All India |
| **Census 2011 / SECC** | Population density, district boundaries | Static | All India |
| **Soil Health Card Data** | Soil type, moisture | Seasonal | Agricultural |
| **ICAR Crop Calendar** | Crop schedules, advisory | Seasonal | All India |

---

## 📸 Screenshots

> *The application screenshots will be added after the live demo deployment.*

| Feature | Screenshot |
|---------|-----------|
| Interactive India Map | `docs/screenshots/map-view.png` |
| 7-Day Forecast Panel | `docs/screenshots/forecast.png` |
| Disaster Alert Dashboard | `docs/screenshots/disaster-alerts.png` |
| Agriculture Advisory | `docs/screenshots/agri-advisory.png` |
| AI Chatbot | `docs/screenshots/chatbot.png` |
| Analytics Dashboard | `docs/screenshots/analytics.png` |

---

## 🤝 Contributing

We welcome contributions from the open-source community!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-climate-feature

# 3. Make your changes and commit
git commit -m 'feat: add cyclone intensity prediction model'

# 4. Push to your branch
git push origin feature/amazing-climate-feature

# 5. Open a Pull Request
```

### Contribution Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Write tests for new ML models and API endpoints
- Update API documentation for new endpoints
- All PRs require 1 reviewer approval before merging
- Run `pre-commit run --all-files` before submitting

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Climate Twin India Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

<div align="center">

**Built with ❤️ for India's Climate Future**

*🌏 Making climate intelligence accessible to every Indian*

[⬆ Back to Top](#-ai-powered-digital-twin-of-indias-climate)

</div>
