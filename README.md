<<<<<<< HEAD
# MuleGuard — Connected Stack

This folder wires your three projects into one working stack:

```
Frontend (React/Vite, :3000)
   │  fetch("/api/v1/ml/predict"), fetch("/api/copilot")
   ▼
Spring Boot backend (:8080)  ── persists every prediction to Postgres
   │                      │
   ▼                      ▼
ML service (:8000)     AI engine (:8001)
  Python/FastAPI          Python/FastAPI
  your trained            Gemini-powered
  XGBoost model            SAR narratives
```

- **frontend/** — your `muletrace-ai` React app (unchanged except a Vite dev
  proxy so relative `/api/...` calls reach Spring Boot).
- **backend-spring/** — your Spring Boot skeleton, now with CORS, a
  `/api/v1/health` and `/api/v1/ml/predict` controller, a `/api/copilot`
  proxy, and a JPA entity that saves every prediction to Postgres.
- **ml-service/** — new. A small FastAPI service that loads your actual
  trained model (`xgboost_fraud_model.json`) and exposes it over HTTP.
- **ai-engine-python/** — your Gemini investigation microservice, plus a
  new `/api/copilot` route for the SAR narrative drafting button, and a
  sanitized `.env` (see **Security** below).

## Run order

**1. Postgres** — you said you already have it running. Make sure a
database named `muleguard_db` exists and matches the credentials in
`backend-spring/src/main/resources/application.properties`:

```sql
CREATE DATABASE muleguard_db;
```

Spring's `ddl-auto=update` will create the `prediction_records` table
automatically on first run — no manual schema needed.

**2. ML service** (port 8000)

```bash
cd ml-service
pip install -r requirements.txt --break-system-packages   # or use a venv
uvicorn app.main:app --port 8000
```

**3. AI engine** (port 8001)

```bash
cd ai-engine-python
cp .env.example .env        # then paste your real Gemini key into .env
pip install -r requirements.txt --break-system-packages
uvicorn main:app --port 8001
```

**4. Spring Boot backend** (port 8080)

```bash
cd backend-spring
./mvnw spring-boot:run
```

**5. Frontend** (port 3000)

```bash
cd frontend
npm install
npm run dev
```

Then open the app, go to **Secure Interfaces**, and toggle "Use Spring
Backend" on (it already defaults to `http://localhost:8080` /
`/api/v1/ml/predict`). Hit "Test Connection" then "Test ML Prediction" —
that flows all the way through Spring → ml-service → your real trained
model and back.

## What's real vs. what's a placeholder

- The XGBoost model call is **real** — I tested it directly against your
  `xgboost_fraud_model.json` and it returns live probabilities.
- **Balance-based inputs**: your model was trained on PaySim data, which
  needs before/after account balances. The frontend doesn't send those
  (it only has amount/accounts/method/timestamp), so `ml-service`
  estimates them conservatively (assumes the source account is drained).
  This is a placeholder for a real gap — if you get real balance data
  into the frontend later, swap the adapter logic in
  `ml-service/app/main.py` (`to_paysim_row`) for the real values and
  accuracy will improve.
- Everything else (Spring↔ML, Spring↔AI engine, CORS, Postgres
  persistence, Vite proxy) is fully wired, not mocked.

## Security — please do this before anything else

Your `ai-engine-python/.env` had a **live Gemini API key sitting in
plaintext** in the files you uploaded. I already saw it in this
conversation, so treat it as compromised:

1. **Rotate the key now** in Google AI Studio / Google Cloud Console.
2. I replaced the key in this bundle's `.env` with a placeholder, and
   added `.gitignore` + `.env.example` so a real key never gets
   committed again.
3. Put your new key only in `ai-engine-python/.env`, never in
   `.env.example`, never in git.

## Not tested here

I don't have Maven-Central or Postgres access in this sandbox, so I
couldn't actually compile the Java or run a live DB round-trip. The
Spring code follows standard, well-worn patterns (`RestTemplate`,
`spring-data-jpa`, `@CrossOrigin` via `WebMvcConfigurer`) — but run
`./mvnw spring-boot:run` locally and let me know if anything doesn't
compile and I'll fix it.
=======
# Code Brains

Repository for Hackathon Team Code Brains.
Here is the updated README.md reflecting the transition to Agentic AI for Fraudulent Transactions and Mule Accounts.

Agentic AI for Fraudulent Transactions and Mule Accounts
This project leverages Agentic AI to revolutionize the detection of fraudulent transactions and mule accounts within banking systems. Moving beyond static models, this agent-based approach acts as an autonomous investigator, processing complex data to identify illicit funds, money laundering patterns, and mule account activity with high precision and transparency.

🚀 Overview
Traditional manual detection struggles to keep pace with the massive volume of banking data and the rapidly evolving tactics of modern fraudsters [00:16]. Our Agentic AI platform enhances institutional security by:

Autonomous Risk Analysis: Utilizing intelligent agents to autonomously process and score accounts based on risk profiles .

Explainable AI (XAI) Engine: Providing investigators with clear, transparent reasoning behind every high-risk flag, detailing exactly which features triggered the alert [02:33], [02:57].

Faster Investigation Cycles: enabling investigators to prioritize high-risk threats instantly, reducing the time spent on genuine accounts .

Audit-Ready Trails: Automatically documenting the reasoning and history of every analysis to ensure regulatory compliance.
🛠 How It Works
Intelligent Data Ingestion: The Agentic system consumes account and transaction data via direct, real-time integration with core banking systems.

Contextual Risk Assessment: Agents evaluate transactions across multiple risk categories, distinguishing between normal, potentially suspicious, and high-risk accounts.

Explainability Dashboard: Analysts interact with an investigation dashboard that highlights influential features and provides a "reasoning trail" for every prediction, fostering trust in the AI's output.

Informed Decision Making: The system moves beyond simple alerts, providing investigators with the context needed to make rapid, informed decisions.

📋 Key Features
Agent-Powered Detection: Sophisticated models designed to spot complex patterns indicative of mule account activity.

Explainability Panel: Automatically ranks the most influential factors behind every prediction, ensuring transparency in AI decision-making.

Scalable Architecture: Designed for deployment within large-scale banking environments to provide continuous, real-time fraud monitoring.
>>>>>>> 26a6597d8f8a6eca43b5393131116fda7afaa882
