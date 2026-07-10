import ast
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

METRICS_DIR = PROJECT_ROOT / "reports" / "metrics"

SYNTHETIC_DIR = PROJECT_ROOT / "data" / "synthetic"

MULE_ACCOUNTS_PATH = (
    METRICS_DIR / "detected_mule_accounts.csv"
)

TRANSACTION_SCORES_PATH = (
    METRICS_DIR / "synthetic_transaction_scores.csv"
)

OUTPUT_PATH = (
    SYNTHETIC_DIR / "investigation_payloads.json"
)

SYNTHETIC_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# SAFE LIST PARSER
# ============================================================

def parse_list_field(value):
    """
    Safely convert a CSV string representation of a list
    back into a Python list.
    """

    if isinstance(value, list):
        return value

    if pd.isna(value):
        return []

    try:
        parsed = ast.literal_eval(str(value))

        if isinstance(parsed, list):
            return parsed

        return []

    except (
        ValueError,
        SyntaxError,
    ):
        return []


# ============================================================
# RECOMMENDED ACTION
# ============================================================

def get_recommended_action(
    risk_level,
    risk_score,
):
    """
    Map mule risk level to an operational recommendation.
    """

    if risk_level == "CRITICAL":
        return "IMMEDIATE_INVESTIGATION"

    if risk_level == "HIGH":
        return "PRIORITY_REVIEW"

    if risk_level == "MEDIUM":
        return "ENHANCED_MONITORING"

    return "STANDARD_MONITORING"


# ============================================================
# TRANSACTION RISK SUMMARY
# ============================================================

def get_transaction_summary(
    related_transactions,
):
    """
    Summarize the ML transaction risks connected
    to one suspicious account.
    """

    if not related_transactions:
        return {
            "total_related_transactions": 0,
            "ml_flagged_transactions": 0,
            "critical_transactions": 0,
            "maximum_fraud_probability": 0.0,
            "average_fraud_probability": 0.0,
        }

    probabilities = [
        float(
            transaction.get(
                "fraud_probability",
                0.0,
            )
        )
        for transaction in related_transactions
    ]

    ml_flagged = sum(
        bool(
            transaction.get(
                "predicted_fraud",
                False,
            )
        )
        for transaction in related_transactions
    )

    critical_count = sum(
        transaction.get(
            "transaction_risk_level"
        ) == "CRITICAL"
        for transaction in related_transactions
    )

    return {
        "total_related_transactions": len(
            related_transactions
        ),
        "ml_flagged_transactions": int(
            ml_flagged
        ),
        "critical_transactions": int(
            critical_count
        ),
        "maximum_fraud_probability": round(
            max(probabilities),
            8,
        ),
        "average_fraud_probability": round(
            sum(probabilities)
            / len(probabilities),
            8,
        ),
    }


# ============================================================
# BUILD RELATED TRANSACTIONS
# ============================================================

def get_related_transactions(
    account_id,
    transactions_df,
):
    """
    Find every transaction where the suspicious account
    appears as either sender or receiver.
    """

    related = transactions_df[
        (transactions_df["nameOrig"] == account_id)
        | (transactions_df["nameDest"] == account_id)
    ].copy()

    related = related.sort_values(
        [
            "step",
            "transaction_id",
        ]
    )

    transaction_records = []

    for _, row in related.iterrows():

        direction = (
            "OUTGOING"
            if row["nameOrig"] == account_id
            else "INCOMING"
        )

        transaction_records.append({
            "transaction_id": str(
                row["transaction_id"]
            ),
            "chain_id": str(
                row["chain_id"]
            ),
            "step": int(
                row["step"]
            ),
            "type": str(
                row["type"]
            ),
            "direction": direction,
            "amount": round(
                float(row["amount"]),
                2,
            ),
            "sender": str(
                row["nameOrig"]
            ),
            "receiver": str(
                row["nameDest"]
            ),
            "fraud_probability": round(
                float(
                    row["fraud_probability"]
                ),
                8,
            ),
            "predicted_fraud": bool(
                row["predicted_fraud"]
            ),
            "transaction_risk_level": str(
                row[
                    "transaction_risk_level"
                ]
            ),
        })

    return transaction_records


# ============================================================
# BUILD ONE INVESTIGATION CASE
# ============================================================

def create_investigation_case(
    case_number,
    mule_row,
    transactions_df,
):
    """
    Create one structured investigation payload
    for one suspicious account.
    """

    account_id = str(
        mule_row["account_id"]
    )

    risk_score = int(
        mule_row["mule_risk_score"]
    )

    risk_level = str(
        mule_row["mule_risk_level"]
    )

    related_transactions = (
        get_related_transactions(
            account_id,
            transactions_df,
        )
    )

    chain_ids = sorted({
        transaction["chain_id"]
        for transaction
        in related_transactions
    })

    behavioral_evidence = parse_list_field(
        mule_row.get(
            "evidence",
            [],
        )
    )

    pass_through_events = parse_list_field(
        mule_row.get(
            "pass_through_events",
            [],
        )
    )

    transaction_summary = (
        get_transaction_summary(
            related_transactions
        )
    )

    investigation_id = (
        f"INV_{case_number:04d}"
    )

    return {
        "investigation_id": investigation_id,

        "investigation_type": (
            "SUSPECTED_MULE_ACCOUNT"
        ),

        "source_system": (
            "Fraud-Detection-ML"
        ),

        "account_id": account_id,

        "risk_assessment": {
            "mule_risk_score": risk_score,
            "mule_risk_level": risk_level,
            "max_fraud_probability": round(
                float(
                    mule_row[
                        "max_fraud_probability"
                    ]
                ),
                8,
            ),
            "recommended_action": (
                get_recommended_action(
                    risk_level,
                    risk_score,
                )
            ),
        },

        "behavioral_profile": {
            "total_received": round(
                float(
                    mule_row[
                        "total_received"
                    ]
                ),
                2,
            ),
            "total_sent": round(
                float(
                    mule_row[
                        "total_sent"
                    ]
                ),
                2,
            ),
            "turnover_ratio": round(
                float(
                    mule_row[
                        "turnover_ratio"
                    ]
                ),
                4,
            ),
            "unique_senders": int(
                mule_row[
                    "unique_senders"
                ]
            ),
            "unique_receivers": int(
                mule_row[
                    "unique_receivers"
                ]
            ),
            "rapid_pass_through_count": int(
                mule_row[
                    "rapid_pass_through_count"
                ]
            ),
        },

        "behavioral_evidence": (
            behavioral_evidence
        ),

        "pass_through_events": (
            pass_through_events
        ),

        "network_context": {
            "related_chain_ids": chain_ids,
            "chain_count": len(chain_ids),
        },

        "transaction_risk_summary": (
            transaction_summary
        ),

        "related_transactions": (
            related_transactions
        ),

        "ai_agent_context": {
            "task": (
                "Investigate the suspicious account "
                "for potential mule activity, rapid "
                "pass-through behavior, fan-in, fan-out, "
                "and multi-hop laundering."
            ),

            "questions_to_answer": [
                (
                    "Why was this account flagged?"
                ),
                (
                    "What suspicious behavioral patterns "
                    "were detected?"
                ),
                (
                    "Which transactions provide the "
                    "strongest evidence?"
                ),
                (
                    "Is this account acting as a mule, "
                    "intermediary, aggregator, or "
                    "distribution account?"
                ),
                (
                    "What action should the fraud analyst "
                    "take next?"
                ),
            ],
        },
    }


# ============================================================
# CREATE ALL INVESTIGATION PAYLOADS
# ============================================================

def create_all_payloads():

    print(
        "\nLoading detected mule accounts..."
    )

    mule_accounts_df = pd.read_csv(
        MULE_ACCOUNTS_PATH
    )

    print(
        f"Suspicious accounts loaded: "
        f"{len(mule_accounts_df):,}"
    )

    print(
        "\nLoading scored transactions..."
    )

    transactions_df = pd.read_csv(
        TRANSACTION_SCORES_PATH
    )

    print(
        f"Transactions loaded: "
        f"{len(transactions_df):,}"
    )

    investigations = []

    for case_number, (_, mule_row) in enumerate(
        mule_accounts_df.iterrows(),
        start=1,
    ):

        investigation = (
            create_investigation_case(
                case_number,
                mule_row,
                transactions_df,
            )
        )

        investigations.append(
            investigation
        )

    # Sort highest-risk investigations first.

    investigations.sort(
        key=lambda case: (
            case["risk_assessment"][
                "mule_risk_score"
            ],
            case["risk_assessment"][
                "max_fraud_probability"
            ],
        ),
        reverse=True,
    )

    # Reassign IDs after sorting.

    for index, investigation in enumerate(
        investigations,
        start=1,
    ):
        investigation[
            "investigation_id"
        ] = f"INV_{index:04d}"

    critical_cases = sum(
        case["risk_assessment"][
            "mule_risk_level"
        ] == "CRITICAL"
        for case in investigations
    )

    high_cases = sum(
        case["risk_assessment"][
            "mule_risk_level"
        ] == "HIGH"
        for case in investigations
    )

    medium_cases = sum(
        case["risk_assessment"][
            "mule_risk_level"
        ] == "MEDIUM"
        for case in investigations
    )

    output = {
        "payload_version": "1.0",

        "generated_at_utc": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),

        "system": {
            "name": (
                "Autonomous Fraud Triage "
                "and Mule Detection Engine"
            ),
            "transaction_model": (
                "XGBoost-PaySim-v1"
            ),
            "fraud_threshold": 0.01,
        },

        "summary": {
            "total_investigations": len(
                investigations
            ),
            "critical_cases": critical_cases,
            "high_cases": high_cases,
            "medium_cases": medium_cases,
        },

        "investigations": investigations,
    }

    return output


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("CREATING AI INVESTIGATION PAYLOADS")
    print("=" * 70)

    required_files = [
        MULE_ACCOUNTS_PATH,
        TRANSACTION_SCORES_PATH,
    ]

    for path in required_files:

        if not path.exists():

            raise FileNotFoundError(
                f"Required input file not found:\n"
                f"{path}"
            )

    output = create_all_payloads()

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            output,
            file,
            indent=4,
            ensure_ascii=False,
        )

    print("\n" + "=" * 70)
    print("INVESTIGATION PAYLOAD SUMMARY")
    print("=" * 70)

    summary = output["summary"]

    print(
        f"\nTotal investigations : "
        f"{summary['total_investigations']}"
    )

    print(
        f"Critical cases       : "
        f"{summary['critical_cases']}"
    )

    print(
        f"High-risk cases      : "
        f"{summary['high_cases']}"
    )

    print(
        f"Medium-risk cases    : "
        f"{summary['medium_cases']}"
    )

    print("\nOutput saved to:")
    print(OUTPUT_PATH)

    print("\n" + "=" * 70)
    print("AI INVESTIGATION PAYLOADS CREATED")
    print("=" * 70)


if __name__ == "__main__":
    main()