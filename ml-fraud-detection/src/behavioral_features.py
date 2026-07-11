import numpy as np
import pandas as pd


BEHAVIORAL_FEATURES = [
    "sender_prev_txn_count",
    "receiver_prev_txn_count",
    "sender_prev_total_amount",
    "receiver_prev_total_received",
    "sender_prev_avg_amount",
    "receiver_prev_avg_received",
    "sender_prev_unique_destinations",
    "receiver_prev_unique_senders",
    "sender_time_since_prev_txn",
    "receiver_time_since_prev_txn",
    "sender_transaction_velocity",
    "receiver_transaction_velocity",
    "receiver_fan_in",
    "sender_fan_out",
    "rapid_pass_through_candidate",
]


def create_behavioral_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create leakage-safe historical behavioral features.

    For every transaction, features are calculated using only
    previous transactions in chronological order.

    Required columns:
        step
        amount
        nameOrig
        nameDest
        oldbalanceOrg
        newbalanceOrig
        oldbalanceDest
        newbalanceDest

    Important:
        Data must represent PaySim transactions.
        The original DataFrame is not modified.
    """

    print("\nCreating behavioral features...")

    data = df.copy()

    # Preserve original row order
    data["_original_index"] = np.arange(len(data))

    # Sort chronologically.
    # mergesort is stable, preserving original order within same step.
    data = data.sort_values(
        by=["step", "_original_index"],
        kind="mergesort"
    ).reset_index(drop=True)

    # ========================================================
    # 1. PREVIOUS TRANSACTION COUNTS
    # ========================================================

    print("[1/7] Previous transaction counts...")

    data["sender_prev_txn_count"] = (
        data.groupby("nameOrig", sort=False)
        .cumcount()
        .astype("int32")
    )

    data["receiver_prev_txn_count"] = (
        data.groupby("nameDest", sort=False)
        .cumcount()
        .astype("int32")
    )

    # ========================================================
    # 2. PREVIOUS TOTAL AMOUNTS
    # ========================================================

    print("[2/7] Historical transaction amounts...")

    sender_cumulative = (
        data.groupby("nameOrig", sort=False)["amount"]
        .cumsum()
    )

    data["sender_prev_total_amount"] = (
        sender_cumulative - data["amount"]
    ).astype("float32")

    receiver_cumulative = (
        data.groupby("nameDest", sort=False)["amount"]
        .cumsum()
    )

    data["receiver_prev_total_received"] = (
        receiver_cumulative - data["amount"]
    ).astype("float32")

    # ========================================================
    # 3. PREVIOUS AVERAGE AMOUNTS
    # ========================================================

    print("[3/7] Historical average amounts...")

    data["sender_prev_avg_amount"] = np.where(
        data["sender_prev_txn_count"] > 0,
        data["sender_prev_total_amount"]
        / data["sender_prev_txn_count"],
        0.0
    ).astype("float32")

    data["receiver_prev_avg_received"] = np.where(
        data["receiver_prev_txn_count"] > 0,
        data["receiver_prev_total_received"]
        / data["receiver_prev_txn_count"],
        0.0
    ).astype("float32")

    # ========================================================
    # 4. TIME SINCE PREVIOUS TRANSACTION
    # ========================================================

    print("[4/7] Transaction timing features...")

    data["sender_time_since_prev_txn"] = (
        data.groupby("nameOrig", sort=False)["step"]
        .diff()
        .fillna(-1)
        .astype("int16")
    )

    data["receiver_time_since_prev_txn"] = (
        data.groupby("nameDest", sort=False)["step"]
        .diff()
        .fillna(-1)
        .astype("int16")
    )

    # ========================================================
    # 5. TRANSACTION VELOCITY
    # ========================================================

    print("[5/7] Transaction velocity...")

    data["sender_transaction_velocity"] = np.where(
        data["sender_time_since_prev_txn"] > 0,
        1.0 / data["sender_time_since_prev_txn"],
        np.where(
            data["sender_time_since_prev_txn"] == 0,
            1.0,
            0.0
        )
    ).astype("float32")

    data["receiver_transaction_velocity"] = np.where(
        data["receiver_time_since_prev_txn"] > 0,
        1.0 / data["receiver_time_since_prev_txn"],
        np.where(
            data["receiver_time_since_prev_txn"] == 0,
            1.0,
            0.0
        )
    ).astype("float32")

    # ========================================================
    # 6. UNIQUE COUNTERPARTIES
    # ========================================================

    print("[6/7] Unique counterparty features...")

    # Number of previous unique destinations used by sender
    sender_pairs = (
        data[["nameOrig", "nameDest"]]
        .duplicated()
    )

    data["_new_sender_destination"] = (
        ~sender_pairs
    ).astype("int8")

    data["sender_fan_out"] = (
        data.groupby("nameOrig", sort=False)[
            "_new_sender_destination"
        ]
        .cumsum()
        - data["_new_sender_destination"]
    ).astype("int32")

    # Number of previous unique senders to receiver
    receiver_pairs = (
        data[["nameDest", "nameOrig"]]
        .duplicated()
    )

    data["_new_receiver_sender"] = (
        ~receiver_pairs
    ).astype("int8")

    data["receiver_fan_in"] = (
        data.groupby("nameDest", sort=False)[
            "_new_receiver_sender"
        ]
        .cumsum()
        - data["_new_receiver_sender"]
    ).astype("int32")

    data["sender_prev_unique_destinations"] = (
        data["sender_fan_out"]
    )

    data["receiver_prev_unique_senders"] = (
        data["receiver_fan_in"]
    )

    # ========================================================
    # 7. RAPID PASS-THROUGH CANDIDATE
    # ========================================================

    print("[7/7] Mule-account indicators...")

    # A simple transaction-level indicator:
    # large proportion of sender balance is moved and
    # sender is left with almost nothing.
    balance_ratio = np.where(
        data["oldbalanceOrg"] > 0,
        data["amount"] / data["oldbalanceOrg"],
        0.0
    )

    data["rapid_pass_through_candidate"] = (
        (balance_ratio >= 0.8)
        & (data["newbalanceOrig"] <= 1.0)
        & (
            data["type"].astype(str).isin(
                ["TRANSFER", "CASH_OUT"]
            )
        )
    ).astype("int8")

    # ========================================================
    # CLEAN TEMPORARY COLUMNS
    # ========================================================

    data.drop(
        columns=[
            "_new_sender_destination",
            "_new_receiver_sender",
        ],
        inplace=True
    )

    # Restore original order
    data = (
        data.sort_values("_original_index")
        .drop(columns="_original_index")
        .reset_index(drop=True)
    )

    print("Behavioral feature engineering complete.")

    return data


def get_behavioral_feature_columns():
    """
    Return the exact behavioral features used by the model.
    """

    return BEHAVIORAL_FEATURES.copy()