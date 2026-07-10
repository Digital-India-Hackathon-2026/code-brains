import sys
from pathlib import Path
import json


# ============================================================
# ALLOW IMPORTS FROM src/
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"

sys.path.insert(0, str(SRC_DIR))

from predict import predict_fraud


# ============================================================
# TEST TRANSACTIONS
# ============================================================

def main():

    print("=" * 70)
    print("TESTING predict_fraud()")
    print("=" * 70)

    transactions = [

        # ----------------------------------------------------
        # Test 1: Likely legitimate PAYMENT
        # ----------------------------------------------------
        {
            "transaction_id": "TEST_LEGIT_001",
            "step": 100,
            "type": "PAYMENT",
            "amount": 5000.0,
            "oldbalanceOrg": 50000.0,
            "newbalanceOrig": 45000.0,
            "oldbalanceDest": 100000.0,
            "newbalanceDest": 105000.0,
            "nameOrig": "C_TEST_001",
            "nameDest": "M_TEST_001",
        },

        # ----------------------------------------------------
        # Test 2: Suspicious TRANSFER
        # ----------------------------------------------------
        {
            "transaction_id": "TEST_FRAUD_001",
            "step": 500,
            "type": "TRANSFER",
            "amount": 500000.0,
            "oldbalanceOrg": 500000.0,
            "newbalanceOrig": 0.0,
            "oldbalanceDest": 0.0,
            "newbalanceDest": 500000.0,
            "nameOrig": "C_VICTIM_001",
            "nameDest": "C_MULE_001",
        },

        # ----------------------------------------------------
        # Test 3: Suspicious CASH_OUT
        # ----------------------------------------------------
        {
            "transaction_id": "TEST_FRAUD_002",
            "step": 501,
            "type": "CASH_OUT",
            "amount": 450000.0,
            "oldbalanceOrg": 450000.0,
            "newbalanceOrig": 0.0,
            "oldbalanceDest": 10000.0,
            "newbalanceDest": 460000.0,
            "nameOrig": "C_MULE_001",
            "nameDest": "C_CASHOUT_001",
        },
    ]

    # ========================================================
    # RUN PREDICTIONS
    # ========================================================

    for index, transaction in enumerate(
        transactions,
        start=1,
    ):

        print("\n" + "=" * 70)
        print(
            f"TEST TRANSACTION {index}"
        )
        print("=" * 70)

        print("\nInput:")

        print(
            json.dumps(
                transaction,
                indent=4,
            )
        )

        try:

            result = predict_fraud(
                transaction
            )

            print("\nPrediction:")

            print(
                json.dumps(
                    result,
                    indent=4,
                )
            )

        except Exception as error:

            print(
                f"\nERROR: {error}"
            )

    print("\n" + "=" * 70)
    print("PREDICTION TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()