# Live Demo Script: ClimaTwin India

This document guides you through presenting the ClimaTwin India application during a live hackathon demonstration.

---

## 🛠️ Step 1: Pre-Demo Setup

Verify that all systems are running and seeded before the judges arrive.

```bash
# 1. Start the Docker containers
docker compose up -d

# 2. Seed the database (creates tables, loads 36 states, seeds 90 days of weather)
docker compose exec backend python -m app.db.init_db

# 3. Fit and train the ML models (XGBoost, Random Forest, LSTM, Prophet)
docker compose exec backend python -m app.ml.train --all

# 4. Open the browser tabs
# - Frontend: http://localhost:3000
# - Backend swagger: http://localhost:8000/docs
```

---

## 🎭 Demo Flow (Step-by-Step)

### Phase 1: The Landing Page & Hook (1 Minute)
1. **Show the landing page (`http://localhost:3000`)**.
2. **Action:** Highlight the scrolling **Emergency Alert Ticker** at the top of the screen.
3. **Script:** 
   > *"Welcome judges. We are looking at the ClimaTwin India homepage. Notice the active emergency alert marquee scrolling at the top. The platform has already pulled real-time hazard data and is showing a severe flood risk in Assam and an extreme heatwave warning in Delhi. Below, you can see our live status dashboard: 36 states monitored, 4 predictive models running, and alert dispatches occurring in under 2 hours."*

---

### Phase 2: The Digital Twin Interactive Map (2 Minutes)
1. **Click "Launch Climate Twin" or go to the "Climate Twin" navbar link.**
2. **Action:** Toggle between the layers: **Temperature, Precipitation, and Air Quality (AQI)**. Note how the circles on the map recolor dynamically.
3. **Action:** Click on the circle representing **Delhi** or **Assam**.
4. **Script:**
   > *"Let's go into the Climate Twin interface. Here, we see a geospatial representation of India. I can toggle overlays. When I switch to 'Temperature', सौराष्ट्र (Saurashtra) and Rajasthan glow red. Switch to 'Air Quality', and you can see industrial cities lighting up. When I click on Delhi, the sidebar instantly compiles its exact weather telemetry—41.5°C, 120 AQI, and a feels-like temperature of 46°C. This telemetry is cached via Redis, preventing API rate-limit bottlenecks."*

---

### Phase 3: AI Climate Prediction & Simulation (2 Minutes)
1. **Navigate to the "Predictions" dashboard.**
2. **Action:** Point out the **7-Day Forecast Grid** showing temperature, rainfall probability, and hazard risks.
3. **Action:** Locate the **"Climate Simulation Controls"** card in the sidebar. Adjust the **"GHG Warming Offset"** slider to **+2.0°C**.
4. **Action:** Point out how the 7-day forecast risk labels dynamically update (e.g. "Stable Conditions" changes to "Heatwave 90%" or "Drought Risk").
5. **Script:**
   > *"Now, let's explore predictions. Under the Predictions tab, we see the next 7-day outlook powered by our XGBoost and LSTM ensemble. But a digital twin isn't just a weather report; it is a simulation engine. Watch what happens if I increase the Greenhouse Gas Warming Offset slider by 2.0°C. Instantly, our risk classification models recalculate. Day 3 and Day 5 temperature forecasts surge, and risk alerts flip from stable to Heatwave Warning with 90% probability. This allows policy planners to test climate change scenarios on local communities."*

---

### Phase 4: Disaster Warning & Automated Dispatch (2 Minutes)
1. **Navigate to the "Disasters" dashboard.**
2. **Action:** Highlight the **Active Warnings** card displaying the Assam Flood and Delhi Heatwave.
3. **Action:** Go to the **"Simulate Warning Dispatch"** form.
   - Target State: **Gujarat**
   - Hazard: **heavy_rain**
   - Severity: **severe**
   - Message: *"Flash flood warning for Saurashtra districts. Heavy precipitation of 140mm expected. Move livestock to high ground."*
4. **Action:** Click **"Trigger Emergency Broadcast"**. Wait for the toast notification: *"Disaster warning triggered and broadcast to matching subscribers!"*
5. **Script:**
   > *"Under our Disaster tab, emergency dispatchers can manage active warnings. Let's run a test. I am simulating an extreme rainfall warning in Gujarat. I will input the advisory message and click 'Trigger Emergency Broadcast'. Instantly, the backend records the alert, queries our database for users subscribed to Gujarat, and dispatches SMS alerts via Twilio and emails via SMTP. Let's look at our mock backend console—you can see the dispatch logs firing in milliseconds."*

---

### Phase 5: Agriculture Advisory (1 Minute)
1. **Navigate to the "Agriculture" dashboard.**
2. **Action:** Select **Uttar Pradesh** or **Gujarat** from the dropdown.
3. **Action:** Point out the suitability score progress bars and the **"Agronomist AI Advisory"** text cards.
4. **Script:**
   > *"Next is the Agriculture Hub. By correlating 30 days of weather history with crop requirements, ClimaTwin calculates suitability scores for staple crops. In Uttar Pradesh, Wheat shows a 90% suitability score, while Rice is moderate. The AI Agronomist advisory details the direct temperature and rainfall effects on crop growth, helping farmers decide what to sow and when to irrigate."*

---

### Phase 6: Gemini AI Voice Assistant (2 Minutes)
1. **Navigate to the "AI Assistant" tab.**
2. **Action:** Select the suggestion pill: **"What is the flood risk in Assam?"** or type it in.
3. **Action:** Click **Send**. Show the Gemini-generated answer that incorporates the active alert context.
4. **Action:** Turn on the **Voice Output Toggle (speaker icon)**.
5. **Action:** Click the **Microphone icon** and speak: *"Show Delhi temperature trend."*
6. **Script:**
   > *"Finally, we democratize this data using natural language. I will click the suggestion pill: 'What is the flood risk in Assam?'. Gemini responds with local hydrological warnings. Now, watch this: I will toggle the voice speaker output on, click the microphone, and speak: 'Show Delhi temperature trend'. The browser transcribes my speech, queries the AI, and speaks the heatwave advisory back to us in real time. We support Hindi and English, breaking the language barrier for rural farmers."*

---

### Phase 7: Wrap-up (1 Minute)
1. **Show the "About" page.**
2. **Action:** Point out the active **Diagnostics Checklist** showing all systems green.
3. **Script:**
   > *"Judges, we have built a complete, production-ready, Dockerized Digital Twin of India's climate. From interactive maps and counterfactual simulators to automated Twilio alerts and voice-enabled Gemini assistance, ClimaTwin puts actionable climate intelligence in the hands of every policymaker and farmer. Thank you, we are now open for questions."*
