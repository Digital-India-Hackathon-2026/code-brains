import sys
from pathlib import Path

import pandas as pd


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from predict import predict_fraud


SYNTHETIC_DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "synthetic"
    / "mule_chains.csv"
)


# ============================================================
# RISK LEVEL
# ============================================================

def get_mule_risk_level(score):

    if score >= 80:
        return "CRITICAL"

    if score >= 60:
        return "HIGH"

    if score >= 30:
        return "MEDIUM"

    return "LOW"


# ============================================================
# TRANSACTION ML SCORING
# ============================================================

def score_transactions(df):

    print("\nScoring transactions with XGBoost...")

    results = []

    for _, row in df.iterrows():

        transaction = {
            "transaction_id": row["transaction_id"],
            "step": int(row["step"]),
            "type": str(row["type"]),
            "amount": float(row["amount"]),
            "oldbalanceOrg": float(
                row["oldbalanceOrg"]
            ),
            "newbalanceOrig": float(
                row["newbalanceOrig"]
            ),
            "oldbalanceDest": float(
                row["oldbalanceDest"]
            ),
            "newbalanceDest": float(
                row["newbalanceDest"]
            ),
            "nameOrig": str(row["nameOrig"]),
            "nameDest": str(row["nameDest"]),
        }

        prediction = predict_fraud(transaction)

        results.append({
            "transaction_id": row[
                "transaction_id"
            ],
            "fraud_probability": prediction[
                "fraud_probability"
            ],
            "predicted_fraud": prediction[
                "predicted_fraud"
            ],
            "transaction_risk_level": prediction[
                "risk_level"
            ],
        })

    prediction_df = pd.DataFrame(results)

    return df.merge(
        prediction_df,
        on="transaction_id",
        how="left",
    )


# ============================================================
# ACCOUNT HISTORY
# ============================================================

def build_account_history(df):

    history = {}

    for _, row in df.sort_values(
        ["step", "transaction_id"]
    ).iterrows():

        sender = str(row["nameOrig"])
        receiver = str(row["nameDest"])

        if sender not in history:
            history[sender] = {
                "sent": [],
                "received": [],
            }

        if receiver not in history:
            history[receiver] = {
                "sent": [],
                "received": [],
            }

        transaction_record = {
            "transaction_id": row[
                "transaction_id"
            ],
            "chain_id": row["chain_id"],
            "step": int(row["step"]),
            "type": str(row["type"]),
            "amount": float(row["amount"]),
            "sender": sender,
            "receiver": receiver,
            "fraud_probability": float(
                row["fraud_probability"]
            ),
        }

        history[sender]["sent"].append(
            transaction_record
        )

        history[receiver]["received"].append(
            transaction_record
        )

    return history


# ============================================================
# ANALYZE ONE ACCOUNT
# ============================================================

def analyze_account(
    account_id,
    account_history,
    max_pass_through_steps=2,
):

    sent = account_history["sent"]
    received = account_history["received"]

    score = 0
    evidence = []

    total_received = sum(
        txn["amount"]
        for txn in received
    )

    total_sent = sum(
        txn["amount"]
        for txn in sent
    )

    unique_senders = len({
        txn["sender"]
        for txn in received
    })

    unique_receivers = len({
        txn["receiver"]
        for txn in sent
    })

    max_fraud_probability = max(
        [
            txn["fraud_probability"]
            for txn in sent + received
        ],
        default=0.0,
    )

    # --------------------------------------------------------
    # 1. ML fraud evidence
    # --------------------------------------------------------

    if max_fraud_probability >= 0.85:

        score += 25

        evidence.append(
            "Account is connected to at least one "
            "transaction with critical ML fraud probability."
        )

    elif max_fraud_probability >= 0.01:

        score += 15

        evidence.append(
            "Account is connected to an ML-flagged "
            "fraud transaction."
        )

    # --------------------------------------------------------
    # 2. Rapid pass-through detection
    # --------------------------------------------------------

       # --------------------------------------------------------
    # 2. RAPID PASS-THROUGH DETECTION
    # --------------------------------------------------------

    pass_through_events = []

    # For every outgoing transaction, calculate all funds
    # received during the recent detection window.
    # This correctly handles fan-in aggregation:
    #
    # Multiple incoming transactions
    #           ↓
    #        Mule account
    #           ↓
    # One large outgoing transaction

    for outgoing in sent:

        recent_incoming = [
            incoming
            for incoming in received
            if (
                0
                <= outgoing["step"] - incoming["step"]
                <= max_pass_through_steps
            )
        ]

        if not recent_incoming:
            continue

        total_recent_received = sum(
            incoming["amount"]
            for incoming in recent_incoming
        )

        if total_recent_received <= 0:
            continue

        pass_through_ratio = (
            outgoing["amount"]
            / total_recent_received
        )

        if pass_through_ratio >= 0.80:

            pass_through_events.append({
                "incoming_transactions": [
                    incoming["transaction_id"]
                    for incoming in recent_incoming
                ],

                "outgoing_transaction": outgoing[
                    "transaction_id"
                ],

                "incoming_transaction_count": len(
                    recent_incoming
                ),

                "total_recent_received": round(
                    total_recent_received,
                    2,
                ),

                "outgoing_amount": round(
                    outgoing["amount"],
                    2,
                ),

                "time_window_steps": int(
                    max(
                        outgoing["step"]
                        - incoming["step"]
                        for incoming
                        in recent_incoming
                    )
                ),

                "pass_through_ratio": round(
                    pass_through_ratio,
                    4,
                ),
            })

    if pass_through_events:

        score += 35

        evidence.append(
            "Account rapidly transferred at least 80% "
            "of recently received funds."
        )
    # --------------------------------------------------------
    # 3. Fan-in detection
    # --------------------------------------------------------

    if unique_senders >= 3:

        score += 25

        evidence.append(
            f"Account received funds from "
            f"{unique_senders} unique senders."
        )

    # --------------------------------------------------------
    # 4. Fan-out detection
    # --------------------------------------------------------

    if unique_receivers >= 3:

        score += 20

        evidence.append(
            f"Account sent funds to "
            f"{unique_receivers} unique receivers."
        )

    # --------------------------------------------------------
    # 5. High turnover ratio
    # --------------------------------------------------------

    turnover_ratio = (
        total_sent / total_received
        if total_received > 0
        else 0.0
    )

    if (
        total_received > 0
        and turnover_ratio >= 0.80
    ):

        score += 20

        evidence.append(
            "Account moved at least 80% of all "
            "funds it received."
        )

    # Maximum score = 100
    score = min(score, 100)

    return {
        "account_id": account_id,
        "mule_risk_score": score,
        "mule_risk_level": (
            get_mule_risk_level(score)
        ),
        "total_received": round(
            total_received,
            2,
        ),
        "total_sent": round(
            total_sent,
            2,
        ),
        "turnover_ratio": round(
            turnover_ratio,
            4,
        ),
        "unique_senders": unique_senders,
        "unique_receivers": unique_receivers,
        "max_fraud_probability": round(
            max_fraud_probability,
            8,
        ),
        "rapid_pass_through_count": len(
            pass_through_events
        ),
        "pass_through_events": (
            pass_through_events
        ),
        "evidence": evidence,
    }


# ============================================================
# DETECT MULE ACCOUNTS
# ============================================================

def detect_mule_accounts(df):

    scored_df = score_transactions(df)

    account_histories = build_account_history(
        scored_df
    )

    results = []

    for account_id, history in (
        account_histories.items()
    ):

        result = analyze_account(
            account_id,
            history,
        )

        results.append(result)

    results_df = pd.DataFrame(results)

    results_df = results_df.sort_values(
        [
            "mule_risk_score",
            "max_fraud_probability",
        ],
        ascending=False,
    ).reset_index(drop=True)

    return results_df, scored_df


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("MULE ACCOUNT DETECTION ENGINE")
    print("=" * 70)

    if not SYNTHETIC_DATA_PATH.exists():

        raise FileNotFoundError(
            "Synthetic mule-chain data not found:\n"
            f"{SYNTHETIC_DATA_PATH}"
        )

    print("\nLoading synthetic mule chains...")

    df = pd.read_csv(
        SYNTHETIC_DATA_PATH
    )

    print(
        f"Transactions loaded: {len(df):,}"
    )

    print(
        f"Chains loaded: "
        f"{df['chain_id'].nunique()}"
    )

    results_df, scored_transactions = (
        detect_mule_accounts(df)
    )

    # --------------------------------------------------------
    # Only suspicious accounts for display
    # --------------------------------------------------------

    suspicious_accounts = results_df[
        results_df["mule_risk_score"] >= 30
    ].copy()

    print("\n" + "=" * 70)
    print("SUSPICIOUS ACCOUNTS")
    print("=" * 70)

    display_columns = [
        "account_id",
        "mule_risk_score",
        "mule_risk_level",
        "total_received",
        "total_sent",
        "unique_senders",
        "unique_receivers",
        "rapid_pass_through_count",
        "max_fraud_probability",
    ]

    print(
        suspicious_accounts[
            display_columns
        ].to_string(index=False)
    )

    # --------------------------------------------------------
    # Save outputs
    # --------------------------------------------------------

    output_dir = (
        PROJECT_ROOT
        / "reports"
        / "metrics"
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    suspicious_path = (
        output_dir
        / "detected_mule_accounts.csv"
    )

    transactions_path = (
        output_dir
        / "synthetic_transaction_scores.csv"
    )

    suspicious_accounts.to_csv(
        suspicious_path,
        index=False,
    )

    scored_transactions.to_csv(
        transactions_path,
        index=False,
    )

    print("\n" + "=" * 70)
    print("MULE DETECTION COMPLETE")
    print("=" * 70)

    print("\nSuspicious accounts saved to:")
    print(suspicious_path)

    print("\nTransaction scores saved to:")
    print(transactions_path)


if __name__ == "__main__":
    main()