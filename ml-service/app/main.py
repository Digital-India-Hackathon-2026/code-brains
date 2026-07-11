"""
MuleGuard ML Service
=====================
Thin FastAPI wrapper around the trained XGBoost fraud model
(models/xgboost_fraud_model.json). Spring Boot calls this service;
this service never talks to the frontend directly.

Run:
    uvicorn app.main:app --reload --port 8000
"""

from datetime import datetime
from pathlib import Path
from typing import List, Optional

import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.feature_engineering import create_transaction_features

# ------------------------------------------------------------------
# Paths / artifacts (same trained model you produced in ml-fraud-detection)
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "xgboost_fraud_model.json"
THRESHOLD_PATH = BASE_DIR / "models" / "threshold.json"
FEATURES_PATH = BASE_DIR / "models" / "xgboost_feature_columns.json"

import json

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

MODEL = xgb.XGBClassifier()
MODEL.load_model(str(MODEL_PATH))

with open(THRESHOLD_PATH) as f:
    FRAUD_THRESHOLD = float(json.load(f)["fraud_threshold"])

with open(FEATURES_PATH) as f:
    FEATURE_COLUMNS = json.load(f)

# ------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------
app = FastAPI(title="MuleGuard ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # only Spring Boot calls this internally; tighten in prod
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Request/response contracts (this is what Spring Boot sends/receives)
# ------------------------------------------------------------------
class FrontendTransaction(BaseModel):
    id: Optional[str] = None
    sourceAccount: str
    sourceHolder: Optional[str] = None
    sourceBank: Optional[str] = None
    destAccount: str
    destHolder: Optional[str] = None
    destBank: Optional[str] = None
    amount: float
    timestamp: str
    method: Optional[str] = "TRANSFER"


class PredictionResult(BaseModel):
    transactionId: Optional[str]
    fraudProbability: float
    compositeRiskScore: float
    riskLevel: str
    predictedFraud: bool
    flaggedReasons: List[str]
    model: str
    timestamp: str


# ------------------------------------------------------------------
# Adapter: frontend UPI/IMPS-style payload -> PaySim-style model input
#
# NOTE: the model was trained on the PaySim dataset, whose features are
# balance-before/after based (oldbalanceOrg, newbalanceOrig, etc).
# The frontend does not send account balances (it only has amount,
# accounts, method, timestamp), so we estimate the balance fields with
# a conservative "worst case" assumption: the source account is drained
# and the destination account had nothing before. This lets the trained
# model run today; wire in real balance data later for stronger accuracy.
# ------------------------------------------------------------------
METHOD_TO_PAYSIM_TYPE = {
    "UPI": "TRANSFER",
    "IMPS": "TRANSFER",
    "NEFT": "TRANSFER",
    "RTGS": "TRANSFER",
    "CASH": "CASH_OUT",
    "ATM": "CASH_OUT",
    "CARD": "PAYMENT",
    "DEBIT": "DEBIT",
}


def to_paysim_row(tx: FrontendTransaction, step: int) -> dict:
    paysim_type = METHOD_TO_PAYSIM_TYPE.get((tx.method or "TRANSFER").upper(), "TRANSFER")
    amount = float(tx.amount)
    return {
        "transaction_id": tx.id,
        "step": step,
        "type": paysim_type,
        "amount": amount,
        "oldbalanceOrg": amount,
        "newbalanceOrig": 0.0,
        "oldbalanceDest": 0.0,
        "newbalanceDest": amount,
    }


def get_risk_level(probability: float, threshold: float) -> str:
    if probability < 0.001:
        return "LOW"
    if probability < threshold:
        return "MEDIUM"
    if probability < 0.85:
        return "HIGH"
    return "CRITICAL"


def get_risk_factors(row: dict) -> List[str]:
    factors = []
    if row["type"] == "TRANSFER":
        factors.append("Transaction is a TRANSFER, a type associated with fraud patterns in PaySim.")
    elif row["type"] == "CASH_OUT":
        factors.append("Transaction is a CASH_OUT, a type associated with fraud patterns in PaySim.")
    if row["amount"] > 0:
        factors.append("Source account balance was estimated as fully drained by this transaction.")
    if not factors:
        factors.append("No major rule-based risk indicators detected.")
    return factors


def run_prediction(tx: FrontendTransaction) -> PredictionResult:
    try:
        step = int(pd.to_datetime(tx.timestamp).hour) if tx.timestamp else 0
    except Exception:
        step = 0

    row = to_paysim_row(tx, step)
    input_df = pd.DataFrame([row])
    featured_df = create_transaction_features(input_df)

    X = featured_df[FEATURE_COLUMNS].replace([np.inf, -np.inf], np.nan).fillna(0)
    probability = float(MODEL.predict_proba(X)[0, 1])
    predicted_fraud = bool(probability >= FRAUD_THRESHOLD)
    risk_level = get_risk_level(probability, FRAUD_THRESHOLD)

    return PredictionResult(
        transactionId=tx.id,
        fraudProbability=round(probability, 8),
        compositeRiskScore=round(probability * 100, 2),
        riskLevel=risk_level,
        predictedFraud=predicted_fraud,
        flaggedReasons=get_risk_factors(row),
        model="XGBoost-PaySim-v1",
        timestamp=datetime.utcnow().isoformat(),
    )


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ML service is running", "model": "XGBoost-PaySim-v1", "threshold": FRAUD_THRESHOLD}


@app.post("/predict", response_model=List[PredictionResult])
def predict(transactions: List[FrontendTransaction]):
    if not transactions:
        raise HTTPException(status_code=400, detail="No transactions provided.")
    try:
        return [run_prediction(tx) for tx in transactions]
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Prediction failed: {str(e)}")
