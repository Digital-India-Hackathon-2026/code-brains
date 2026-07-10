import json
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb

from feature_engineering import create_transaction_features


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "xgboost_fraud_model.json"
)

THRESHOLD_PATH = (
    PROJECT_ROOT
    / "models"
    / "threshold.json"
)

FEATURES_PATH = (
    PROJECT_ROOT
    / "models"
    / "xgboost_feature_columns.json"
)


# ============================================================
# LOAD ARTIFACTS ONCE
# ============================================================

def load_artifacts():

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    if not THRESHOLD_PATH.exists():
        raise FileNotFoundError(
            f"Threshold not found: {THRESHOLD_PATH}"
        )

    if not FEATURES_PATH.exists():
        raise FileNotFoundError(
            f"Feature file not found: {FEATURES_PATH}"
        )

    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH)

    with open(THRESHOLD_PATH, "r") as file:
        threshold_data = json.load(file)

    fraud_threshold = float(
        threshold_data["fraud_threshold"]
    )

    with open(FEATURES_PATH, "r") as file:
        feature_columns = json.load(file)

    return (
        model,
        fraud_threshold,
        feature_columns,
    )


MODEL, FRAUD_THRESHOLD, FEATURE_COLUMNS = (
    load_artifacts()
)


# ============================================================
# INPUT VALIDATION
# ============================================================

REQUIRED_INPUT_FIELDS = [
    "step",
    "type",
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest",
]


def validate_transaction(transaction):

    missing_fields = [
        field
        for field in REQUIRED_INPUT_FIELDS
        if field not in transaction
    ]

    if missing_fields:
        raise ValueError(
            "Missing required transaction fields: "
            + ", ".join(missing_fields)
        )

    valid_types = {
        "CASH_IN",
        "CASH_OUT",
        "DEBIT",
        "PAYMENT",
        "TRANSFER",
    }

    if transaction["type"] not in valid_types:
        raise ValueError(
            f"Invalid transaction type: "
            f"{transaction['type']}"
        )

    if float(transaction["amount"]) < 0:
        raise ValueError(
            "Transaction amount cannot be negative."
        )


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(
    probability,
    fraud_threshold,
):

    if probability < 0.001:
        return "LOW"

    if probability < fraud_threshold:
        return "MEDIUM"

    if probability < 0.85:
        return "HIGH"

    return "CRITICAL"


# ============================================================
# EXPLAINABLE RISK FACTORS
# ============================================================

def get_risk_factors(
    transaction,
    features,
):

    factors = []

    amount = float(
        transaction["amount"]
    )

    old_orig = float(
        transaction["oldbalanceOrg"]
    )

    new_orig = float(
        transaction["newbalanceOrig"]
    )

    old_dest = float(
        transaction["oldbalanceDest"]
    )

    transaction_type = (
        transaction["type"]
    )

    if transaction_type == "TRANSFER":
        factors.append(
            "Transaction is a TRANSFER, a transaction "
            "type associated with fraud patterns in PaySim."
        )

    elif transaction_type == "CASH_OUT":
        factors.append(
            "Transaction is a CASH_OUT, a transaction "
            "type associated with fraud patterns in PaySim."
        )

    if new_orig == 0 and old_orig > 0:
        factors.append(
            "Origin account balance was completely drained."
        )

    if old_orig > 0:

        balance_ratio = (
            amount / old_orig
        )

        if balance_ratio >= 0.9:
            factors.append(
                "Transaction moves at least 90% of the "
                "origin account's previous balance."
            )

    if old_dest == 0 and amount > 0:
        factors.append(
            "Destination account had zero recorded balance "
            "before receiving the transaction."
        )

    if (
        features["orig_balance_error"] > 0
    ):
        factors.append(
            "Origin balance behavior contains a "
            "transaction-balance inconsistency."
        )

    if not factors:
        factors.append(
            "No major rule-based risk indicators detected."
        )

    return factors


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict_fraud(transaction):
    """
    Predict fraud risk for one PaySim-style transaction.

    Parameters
    ----------
    transaction : dict

    Required fields:
        step
        type
        amount
        oldbalanceOrg
        newbalanceOrig
        oldbalanceDest
        newbalanceDest

    Optional:
        transaction_id
        nameOrig
        nameDest

    Returns
    -------
    dict containing:
        transaction_id
        fraud_probability
        fraud_threshold
        predicted_fraud
        risk_level
        risk_factors
        model
    """

    validate_transaction(transaction)

    input_df = pd.DataFrame(
        [transaction]
    )

    featured_df = (
        create_transaction_features(
            input_df
        )
    )

    X = (
        featured_df[FEATURE_COLUMNS]
        .replace(
            [np.inf, -np.inf],
            np.nan,
        )
        .fillna(0)
    )

    probability = float(
        MODEL.predict_proba(X)[0, 1]
    )

    predicted_fraud = bool(
        probability >= FRAUD_THRESHOLD
    )

    risk_level = get_risk_level(
        probability,
        FRAUD_THRESHOLD,
    )

    feature_values = (
        featured_df.iloc[0].to_dict()
    )

    risk_factors = get_risk_factors(
        transaction,
        feature_values,
    )

    return {
        "transaction_id": transaction.get(
            "transaction_id"
        ),
        "fraud_probability": round(
            probability,
            8,
        ),
        "fraud_threshold": FRAUD_THRESHOLD,
        "predicted_fraud": predicted_fraud,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "model": "XGBoost-PaySim-v1",
    }