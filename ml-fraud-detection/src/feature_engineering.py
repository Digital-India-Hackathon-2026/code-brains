import numpy as np
import pandas as pd


TRANSACTION_FEATURES = [
    "step",
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest",
    "orig_balance_change",
    "dest_balance_change",
    "orig_balance_error",
    "dest_balance_error",
    "amount_to_orig_balance",
    "amount_to_dest_balance",
    "origin_zero_after",
    "destination_zero_before",
    "is_transfer",
    "is_cash_out",
    "hour",
    "day",
]


def create_transaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create transaction-level features for fraud detection.

    Important:
    - Does not modify the original DataFrame.
    - Does not include isFraud as a feature.
    - Does not include isFlaggedFraud due to leakage risk.
    - Does not use raw account IDs directly as ML features.
    """

    data = df.copy()

    # --------------------------------------------------------
    # Balance changes
    # --------------------------------------------------------

    data["orig_balance_change"] = (
        data["oldbalanceOrg"] - data["newbalanceOrig"]
    )

    data["dest_balance_change"] = (
        data["newbalanceDest"] - data["oldbalanceDest"]
    )

    # --------------------------------------------------------
    # Balance inconsistencies
    # --------------------------------------------------------

    data["orig_balance_error"] = np.abs(
        data["oldbalanceOrg"]
        - data["amount"]
        - data["newbalanceOrig"]
    )

    data["dest_balance_error"] = np.abs(
        data["oldbalanceDest"]
        + data["amount"]
        - data["newbalanceDest"]
    )

    # --------------------------------------------------------
    # Amount ratios
    # --------------------------------------------------------

    data["amount_to_orig_balance"] = np.where(
        data["oldbalanceOrg"] > 0,
        data["amount"] / data["oldbalanceOrg"],
        0.0,
    )

    data["amount_to_dest_balance"] = np.where(
        data["oldbalanceDest"] > 0,
        data["amount"] / data["oldbalanceDest"],
        0.0,
    )

    # Prevent infinity from entering the model
    data["amount_to_orig_balance"] = (
        data["amount_to_orig_balance"]
        .replace([np.inf, -np.inf], 0)
        .fillna(0)
    )

    data["amount_to_dest_balance"] = (
        data["amount_to_dest_balance"]
        .replace([np.inf, -np.inf], 0)
        .fillna(0)
    )

    # --------------------------------------------------------
    # Zero-balance indicators
    # --------------------------------------------------------

    data["origin_zero_after"] = (
        data["newbalanceOrig"] == 0
    ).astype("int8")

    data["destination_zero_before"] = (
        data["oldbalanceDest"] == 0
    ).astype("int8")

    # --------------------------------------------------------
    # Transaction-type indicators
    # --------------------------------------------------------

    data["is_transfer"] = (
        data["type"] == "TRANSFER"
    ).astype("int8")

    data["is_cash_out"] = (
        data["type"] == "CASH_OUT"
    ).astype("int8")

    # --------------------------------------------------------
    # Time features
    # PaySim step represents one hour
    # --------------------------------------------------------

    data["hour"] = ((data["step"] - 1) % 24).astype("int8")

    data["day"] = ((data["step"] - 1) // 24).astype("int16")

    return data


def get_transaction_feature_columns():
    """
    Return exact transaction feature names used by the ML model.
    """
    return TRANSACTION_FEATURES.copy()