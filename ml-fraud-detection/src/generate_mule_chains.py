import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent

OUTPUT_DIR = PROJECT_ROOT / "data" / "synthetic"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CSV_OUTPUT = OUTPUT_DIR / "mule_chains.csv"
JSON_OUTPUT = OUTPUT_DIR / "mule_chains.json"


def create_transaction(
    transaction_id,
    chain_id,
    step,
    transaction_type,
    amount,
    name_orig,
    old_balance_orig,
    new_balance_orig,
    name_dest,
    old_balance_dest,
    new_balance_dest,
    role,
    expected_risk,
):
    return {
        "transaction_id": transaction_id,
        "chain_id": chain_id,
        "step": step,
        "type": transaction_type,
        "amount": amount,
        "nameOrig": name_orig,
        "oldbalanceOrg": old_balance_orig,
        "newbalanceOrig": new_balance_orig,
        "nameDest": name_dest,
        "oldbalanceDest": old_balance_dest,
        "newbalanceDest": new_balance_dest,
        "account_role": role,
        "expected_risk": expected_risk,
        "is_synthetic_mule": 1,
    }


def generate_mule_chains():

    transactions = []

    # ========================================================
    # CHAIN 1: SIMPLE VICTIM -> MULE -> CASH OUT
    # ========================================================

    transactions.extend([
        create_transaction(
            transaction_id="MULE_TXN_001",
            chain_id="CHAIN_001",
            step=700,
            transaction_type="TRANSFER",
            amount=500000.0,
            name_orig="C_VICTIM_001",
            old_balance_orig=500000.0,
            new_balance_orig=0.0,
            name_dest="C_MULE_001",
            old_balance_dest=0.0,
            new_balance_dest=500000.0,
            role="victim_to_mule",
            expected_risk="CRITICAL",
        ),

        create_transaction(
            transaction_id="MULE_TXN_002",
            chain_id="CHAIN_001",
            step=701,
            transaction_type="CASH_OUT",
            amount=490000.0,
            name_orig="C_MULE_001",
            old_balance_orig=500000.0,
            new_balance_orig=10000.0,
            name_dest="C_CASHOUT_001",
            old_balance_dest=50000.0,
            new_balance_dest=540000.0,
            role="mule_cash_out",
            expected_risk="CRITICAL",
        ),
    ])

    # ========================================================
    # CHAIN 2: MULTI-HOP LAUNDERING
    # ========================================================

    transactions.extend([
        create_transaction(
            "MULE_TXN_003",
            "CHAIN_002",
            710,
            "TRANSFER",
            1000000.0,
            "C_VICTIM_002",
            1000000.0,
            0.0,
            "C_MULE_002_A",
            0.0,
            1000000.0,
            "victim_to_first_mule",
            "CRITICAL",
        ),

        create_transaction(
            "MULE_TXN_004",
            "CHAIN_002",
            711,
            "TRANSFER",
            950000.0,
            "C_MULE_002_A",
            1000000.0,
            50000.0,
            "C_MULE_002_B",
            0.0,
            950000.0,
            "mule_to_mule",
            "CRITICAL",
        ),

        create_transaction(
            "MULE_TXN_005",
            "CHAIN_002",
            712,
            "CASH_OUT",
            900000.0,
            "C_MULE_002_B",
            950000.0,
            50000.0,
            "C_CASHOUT_002",
            100000.0,
            1000000.0,
            "final_cash_out",
            "CRITICAL",
        ),
    ])

    # ========================================================
    # CHAIN 3: FAN-IN PATTERN
    # Multiple victims -> one mule -> cash out
    # ========================================================

    victim_amounts = [
        150000.0,
        200000.0,
        175000.0,
        225000.0,
    ]

    mule_balance = 0.0

    for index, amount in enumerate(
        victim_amounts,
        start=1,
    ):
        old_mule_balance = mule_balance
        mule_balance += amount

        transactions.append(
            create_transaction(
                transaction_id=f"MULE_TXN_FANIN_{index:03d}",
                chain_id="CHAIN_003",
                step=720,
                transaction_type="TRANSFER",
                amount=amount,
                name_orig=f"C_VICTIM_FANIN_{index:03d}",
                old_balance_orig=amount,
                new_balance_orig=0.0,
                name_dest="C_MULE_FANIN_001",
                old_balance_dest=old_mule_balance,
                new_balance_dest=mule_balance,
                role="fan_in_to_mule",
                expected_risk="CRITICAL",
            )
        )

    transactions.append(
        create_transaction(
            transaction_id="MULE_TXN_FANIN_CASHOUT",
            chain_id="CHAIN_003",
            step=721,
            transaction_type="CASH_OUT",
            amount=730000.0,
            name_orig="C_MULE_FANIN_001",
            old_balance_orig=750000.0,
            new_balance_orig=20000.0,
            name_dest="C_CASHOUT_FANIN_001",
            old_balance_dest=0.0,
            new_balance_dest=730000.0,
            role="fan_in_mule_cash_out",
            expected_risk="CRITICAL",
        )
    )

    # ========================================================
    # CHAIN 4: FAN-OUT SMURFING
    # One compromised account -> several mule accounts
    # ========================================================

    output_amounts = [
        190000.0,
        195000.0,
        185000.0,
        180000.0,
        175000.0,
    ]

    victim_balance = sum(output_amounts)

    for index, amount in enumerate(
        output_amounts,
        start=1,
    ):
        old_balance = victim_balance
        victim_balance -= amount

        transactions.append(
            create_transaction(
                transaction_id=f"MULE_TXN_FANOUT_{index:03d}",
                chain_id="CHAIN_004",
                step=730,
                transaction_type="TRANSFER",
                amount=amount,
                name_orig="C_COMPROMISED_FANOUT_001",
                old_balance_orig=old_balance,
                new_balance_orig=victim_balance,
                name_dest=f"C_MULE_FANOUT_{index:03d}",
                old_balance_dest=0.0,
                new_balance_dest=amount,
                role="fan_out_to_mule",
                expected_risk="HIGH",
            )
        )

    # ========================================================
    # SAVE DATA
    # ========================================================

    df = pd.DataFrame(transactions)

    df.to_csv(
        CSV_OUTPUT,
        index=False,
    )

    with open(
        JSON_OUTPUT,
        "w",
    ) as file:
        json.dump(
            transactions,
            file,
            indent=4,
        )

    return df


def main():

    print("=" * 70)
    print("GENERATING SYNTHETIC MULE-ACCOUNT CHAINS")
    print("=" * 70)

    df = generate_mule_chains()

    print(
        f"\nGenerated transactions: {len(df):,}"
    )

    print(
        f"Generated chains: {df['chain_id'].nunique()}"
    )

    print("\nTransactions by chain:")

    print(
        df.groupby("chain_id")
        .size()
        .to_string()
    )

    print("\nAccount roles:")

    print(
        df["account_role"]
        .value_counts()
        .to_string()
    )

    print("\nCSV saved to:")
    print(CSV_OUTPUT)

    print("\nJSON saved to:")
    print(JSON_OUTPUT)

    print("\n" + "=" * 70)
    print("SYNTHETIC MULE CHAINS GENERATED")
    print("=" * 70)


if __name__ == "__main__":
    main()