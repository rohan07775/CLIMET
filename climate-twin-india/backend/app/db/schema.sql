-- ─────────────────────────────────────────────────────────────────────────────
-- app/db/schema.sql
-- Complete PostgreSQL DDL: tables, indexes, and seed data for India's
-- AI-Powered Digital Twin climate backend.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (optional, IDs use BIGSERIAL here)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: states
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(10)  NOT NULL UNIQUE,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    area        DOUBLE PRECISION,           -- km²
    population  BIGINT,
    major_crops TEXT,
    capital     VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_states_name ON states(name);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: weather_data
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_data (
    id          BIGSERIAL PRIMARY KEY,
    state       VARCHAR(100) NOT NULL,
    city        VARCHAR(100),
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION,    -- °C
    humidity    DOUBLE PRECISION,    -- %
    rainfall    DOUBLE PRECISION,    -- mm
    wind_speed  DOUBLE PRECISION,    -- km/h
    pressure    DOUBLE PRECISION,    -- hPa
    aqi         DOUBLE PRECISION,
    heat_index  DOUBLE PRECISION,    -- °C
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source      VARCHAR(50)  NOT NULL DEFAULT 'open-meteo'
);

CREATE INDEX IF NOT EXISTS idx_weather_state       ON weather_data(state);
CREATE INDEX IF NOT EXISTS idx_weather_recorded_at ON weather_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_state_time  ON weather_data(state, recorded_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: prediction_data
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_data (
    id                   BIGSERIAL PRIMARY KEY,
    state                VARCHAR(100) NOT NULL,
    model_used           VARCHAR(50)  NOT NULL,
    prediction_type      VARCHAR(50)  NOT NULL,
    predicted_value      DOUBLE PRECISION NOT NULL,
    confidence_score     DOUBLE PRECISION,
    prediction_for_date  TIMESTAMPTZ  NOT NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_state      ON prediction_data(state);
CREATE INDEX IF NOT EXISTS idx_pred_for_date   ON prediction_data(prediction_for_date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: alerts
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id          BIGSERIAL PRIMARY KEY,
    state       VARCHAR(100) NOT NULL,
    alert_type  VARCHAR(50)  NOT NULL,   -- flood | heatwave | drought | heavy_rain | cyclone
    risk_level  VARCHAR(20)  NOT NULL,   -- low | moderate | high | severe
    message     TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_state     ON alerts(state);
CREATE INDEX IF NOT EXISTS idx_alerts_active    ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_created   ON alerts(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: crop_analysis
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crop_analysis (
    id                BIGSERIAL PRIMARY KEY,
    state             VARCHAR(100) NOT NULL,
    crop_name         VARCHAR(100) NOT NULL,
    suitability_score DOUBLE PRECISION NOT NULL,
    rainfall_effect   VARCHAR(20),
    temperature_effect VARCHAR(20),
    risk_score        DOUBLE PRECISION,
    recommendation    TEXT,
    analyzed_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_state ON crop_analysis(state);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                BIGSERIAL PRIMARY KEY,
    email             VARCHAR(255) NOT NULL UNIQUE,
    hashed_password   VARCHAR(255) NOT NULL,
    full_name         VARCHAR(200),
    phone             VARCHAR(20),
    subscribed_states TEXT,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    is_admin          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data: Indian States (28 states + 8 UTs, representative entries)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO states (name, code, latitude, longitude, area, population, major_crops, capital)
VALUES
  ('Andhra Pradesh',    'AP', 15.9129, 79.7400, 162975,  49386799,  'Rice,Groundnut,Tobacco,Cotton,Chilli',         'Amaravati'),
  ('Arunachal Pradesh', 'AR', 27.1004, 93.6167, 83743,   1383727,   'Rice,Maize,Millet,Wheat,Potato',              'Itanagar'),
  ('Assam',             'AS', 26.2006, 92.9376, 78438,   31205576,  'Tea,Rice,Jute,Mustard,Sugarcane',             'Dispur'),
  ('Bihar',             'BR', 25.0961, 85.3131, 94163,   104099452, 'Rice,Wheat,Maize,Sugarcane,Pulses',           'Patna'),
  ('Chhattisgarh',      'CG', 21.2787, 81.8661, 135192,  25545198,  'Rice,Wheat,Maize,Soybean,Pulses',            'Raipur'),
  ('Goa',               'GA', 15.2993, 74.1240, 3702,    1458545,   'Rice,Coconut,Cashew,Sugarcane',              'Panaji'),
  ('Gujarat',           'GJ', 22.2587, 71.1924, 196024,  60439692,  'Cotton,Groundnut,Wheat,Rice,Tobacco',        'Gandhinagar'),
  ('Haryana',           'HR', 29.0588, 76.0856, 44212,   25351462,  'Wheat,Rice,Sugarcane,Mustard,Barley',        'Chandigarh'),
  ('Himachal Pradesh',  'HP', 31.1048, 77.1734, 55673,   6864602,   'Wheat,Maize,Rice,Potato,Apple',              'Shimla'),
  ('Jharkhand',         'JH', 23.6102, 85.2799, 79716,   32988134,  'Rice,Maize,Pulses,Oilseeds,Wheat',          'Ranchi'),
  ('Karnataka',         'KA', 15.3173, 75.7139, 191791,  61095297,  'Rice,Ragi,Jowar,Sugarcane,Cotton',           'Bengaluru'),
  ('Kerala',            'KL', 10.8505, 76.2711, 38852,   33406061,  'Rice,Coconut,Rubber,Tea,Spices',             'Thiruvananthapuram'),
  ('Madhya Pradesh',    'MP', 22.9734, 78.6569, 308252,  72626809,  'Wheat,Soybean,Rice,Pulses,Cotton',           'Bhopal'),
  ('Maharashtra',       'MH', 19.7515, 75.7139, 307713,  112374333, 'Sugarcane,Cotton,Rice,Wheat,Jowar',          'Mumbai'),
  ('Manipur',           'MN', 24.6637, 93.9063, 22327,   2855794,   'Rice,Maize,Mustard,Pulses,Vegetables',      'Imphal'),
  ('Meghalaya',         'ML', 25.4670, 91.3662, 22429,   2966889,   'Rice,Maize,Potato,Ginger,Turmeric',         'Shillong'),
  ('Mizoram',           'MZ', 23.1645, 92.9376, 21081,   1097206,   'Rice,Maize,Sugarcane,Ginger,Vegetables',    'Aizawl'),
  ('Nagaland',          'NL', 26.1584, 94.5624, 16579,   1978502,   'Rice,Maize,Millets,Pulses,Potato',          'Kohima'),
  ('Odisha',            'OD', 20.9517, 85.0985, 155707,  41974218,  'Rice,Wheat,Pulses,Oilseeds,Jute',           'Bhubaneswar'),
  ('Punjab',            'PB', 31.1471, 75.3412, 50362,   27743338,  'Wheat,Rice,Maize,Sugarcane,Cotton',         'Chandigarh'),
  ('Rajasthan',         'RJ', 27.0238, 74.2179, 342239,  68548437,  'Wheat,Barley,Bajra,Jowar,Mustard',          'Jaipur'),
  ('Sikkim',            'SK', 27.5330, 88.5122, 7096,    610577,    'Rice,Maize,Wheat,Cardamom,Ginger',          'Gangtok'),
  ('Tamil Nadu',        'TN', 11.1271, 78.6569, 130058,  72147030,  'Rice,Sugarcane,Cotton,Groundnut,Banana',    'Chennai'),
  ('Telangana',         'TS', 18.1124, 79.0193, 112077,  35003674,  'Rice,Cotton,Maize,Soybean,Turmeric',        'Hyderabad'),
  ('Tripura',           'TR', 23.9408, 91.9882, 10486,   3673917,   'Rice,Jute,Mustard,Sugarcane,Pineapple',     'Agartala'),
  ('Uttar Pradesh',     'UP', 26.8467, 80.9462, 240928,  199812341, 'Wheat,Rice,Sugarcane,Potato,Pulses',        'Lucknow'),
  ('Uttarakhand',       'UK', 30.0668, 79.0193, 53483,   10086292,  'Wheat,Rice,Maize,Pulses,Apple',             'Dehradun'),
  ('West Bengal',       'WB', 22.9868, 87.8550, 88752,   91276115,  'Rice,Jute,Tea,Potato,Wheat',                'Kolkata'),
  -- Union Territories
  ('Delhi',             'DL', 28.6139, 77.2090, 1484,    16787941,  'Wheat,Rice,Vegetables',                     'New Delhi'),
  ('Jammu and Kashmir', 'JK', 33.7782, 76.5762, 42241,   12541302,  'Rice,Wheat,Maize,Apple,Saffron',            'Srinagar'),
  ('Ladakh',            'LA', 34.1526, 77.5771, 59146,   274289,    'Barley,Wheat,Peas,Buckwheat',               'Leh'),
  ('Chandigarh',        'CH', 30.7333, 76.7794, 114,     1055450,   'Wheat,Rice',                                'Chandigarh'),
  ('Puducherry',        'PY', 11.9416, 79.8083, 479,     1247953,   'Rice,Sugarcane,Groundnut',                  'Puducherry'),
  ('Andaman and Nicobar', 'AN', 11.7401, 92.6586, 8249,  380581,    'Rice,Coconut,Vegetables',                   'Port Blair'),
  ('Lakshadweep',       'LD', 10.5667, 72.6417, 32,      64473,     'Coconut,Vegetables',                        'Kavaratti'),
  ('Dadra and Nagar Haveli and Daman and Diu', 'DD', 20.1809, 73.0169, 603, 586956, 'Rice,Wheat,Sugarcane', 'Daman')
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Sample weather snapshot (used for initial testing)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO weather_data (state, city, latitude, longitude, temperature, humidity, rainfall, wind_speed, pressure, aqi, heat_index, source)
VALUES
  ('Maharashtra',    'Mumbai',      19.0760, 72.8777, 32.5, 82, 12.0, 18.0, 1005.2, 95.0,  38.2, 'seed'),
  ('Delhi',          'New Delhi',   28.6139, 77.2090, 43.1, 25, 0.0,  22.0, 996.0,  175.0, 52.0, 'seed'),
  ('Tamil Nadu',     'Chennai',     13.0827, 80.2707, 35.8, 75, 8.0,  14.0, 1008.5, 85.0,  40.1, 'seed'),
  ('West Bengal',    'Kolkata',     22.5726, 88.3639, 34.2, 88, 18.0, 12.0, 1002.1, 110.0, 42.5, 'seed'),
  ('Karnataka',      'Bengaluru',   12.9716, 77.5946, 29.0, 60, 5.0,  16.0, 1010.0, 65.0,  31.2, 'seed'),
  ('Rajasthan',      'Jaipur',      26.9124, 75.7873, 45.2, 18, 0.0,  28.0, 992.0,  80.0,  55.0, 'seed'),
  ('Kerala',         'Thiruvananthapuram', 8.5241, 76.9366, 28.5, 91, 45.0, 10.0, 1012.0, 40.0, 32.0, 'seed'),
  ('Gujarat',        'Ahmedabad',   23.0225, 72.5714, 40.8, 35, 0.0,  24.0, 994.0,  120.0, 48.3, 'seed'),
  ('Punjab',         'Amritsar',    31.6340, 74.8723, 41.5, 28, 0.0,  19.0, 993.0,  90.0,  49.1, 'seed'),
  ('Assam',          'Guwahati',    26.1445, 91.7362, 30.2, 86, 35.0, 8.0,  1006.0, 55.0,  36.4, 'seed')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Sample alerts
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO alerts (state, alert_type, risk_level, message)
VALUES
  ('Rajasthan',   'heatwave',   'severe',   'Severe heatwave warning: temperatures expected to exceed 46°C. Stay indoors between 11AM-5PM.'),
  ('Delhi',       'heatwave',   'high',     'Heatwave alert: heat index exceeds 50°C. Avoid outdoor activities.'),
  ('Kerala',      'flood',      'high',     'Heavy rainfall warning: IMD forecasts 200mm+ in next 24 hours. Low-lying areas prone to flooding.'),
  ('Assam',       'flood',      'moderate', 'Brahmaputra river water level rising. Monitor for flooding in riverside districts.'),
  ('Maharashtra', 'heavy_rain', 'moderate', 'Heavy rain expected in Mumbai Metropolitan Region. Traffic disruptions likely.')
ON CONFLICT DO NOTHING;
