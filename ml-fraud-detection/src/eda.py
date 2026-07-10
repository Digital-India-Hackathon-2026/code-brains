import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# ============================================================
# PATH CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = PROJECT_ROOT / "data" / "raw" / "paysim.csv"

FIGURES_DIR = PROJECT_ROOT / "reports" / "figures"
METRICS_DIR = PROJECT_ROOT / "reports" / "metrics"

FIGURES_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATASET WITH MEMORY-EFFICIENT DTYPES
# ============================================================

print("=" * 70)
print("PAYSIM DETAILED EDA")
print("=" * 70)

print("\nLoading dataset...")

dtypes = {
    "step": "int16",
    "type": "category",
    "amount": "float32",
    "nameOrig": "string",
    "oldbalanceOrg": "float32",
    "newbalanceOrig": "float32",
    "nameDest": "string",
    "oldbalanceDest": "float32",
    "newbalanceDest": "float32",
    "isFraud": "int8",
    "isFlaggedFraud": "int8",
}

df = pd.read_csv(CSV_PATH, dtype=dtypes)

print(f"Dataset loaded successfully.")
print(f"Rows: {len(df):,}")
print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**3:.2f} GB")


# ============================================================
# 1. GENERAL SUMMARY
# ============================================================

print("\n[1/8] Creating general summary...")

summary = pd.DataFrame({
    "metric": [
        "total_transactions",
        "legitimate_transactions",
        "fraud_transactions",
        "fraud_percentage",
        "unique_origin_accounts",
        "unique_destination_accounts",
        "total_steps",
    ],
    "value": [
        len(df),
        (df["isFraud"] == 0).sum(),
        (df["isFraud"] == 1).sum(),
        df["isFraud"].mean() * 100,
        df["nameOrig"].nunique(),
        df["nameDest"].nunique(),
        df["step"].nunique(),
    ],
})

summary.to_csv(
    METRICS_DIR / "dataset_summary.csv",
    index=False
)

print(summary.to_string(index=False))


# ============================================================
# 2. FRAUD DISTRIBUTION BY TRANSACTION TYPE
# ============================================================

print("\n[2/8] Analyzing fraud by transaction type...")

fraud_by_type = (
    df.groupby("type", observed=True)["isFraud"]
    .agg(
        total_transactions="count",
        fraud_transactions="sum",
        fraud_rate="mean",
    )
    .reset_index()
)

fraud_by_type["fraud_rate_percent"] = (
    fraud_by_type["fraud_rate"] * 100
)

fraud_by_type.to_csv(
    METRICS_DIR / "fraud_by_transaction_type.csv",
    index=False
)

print(fraud_by_type.to_string(index=False))


# Plot fraud transactions by type

fraud_only_by_type = fraud_by_type[
    fraud_by_type["fraud_transactions"] > 0
]

plt.figure(figsize=(8, 5))

plt.bar(
    fraud_only_by_type["type"].astype(str),
    fraud_only_by_type["fraud_transactions"],
)

plt.title("Fraud Transactions by Transaction Type")
plt.xlabel("Transaction Type")
plt.ylabel("Number of Fraud Transactions")

plt.tight_layout()

plt.savefig(
    FIGURES_DIR / "fraud_by_transaction_type.png",
    dpi=200,
)

plt.close()


# ============================================================
# 3. FRAUD VS LEGITIMATE AMOUNT STATISTICS
# ============================================================

print("\n[3/8] Analyzing transaction amounts...")

amount_stats = (
    df.groupby("isFraud")["amount"]
    .agg([
        "count",
        "mean",
        "median",
        "min",
        "max",
        "std",
    ])
)

amount_stats.to_csv(
    METRICS_DIR / "fraud_amount_statistics.csv"
)

print(amount_stats)


# ============================================================
# 4. FRAUD AMOUNT DISTRIBUTION
# ============================================================

print("\n[4/8] Creating fraud amount distribution...")

fraud_df = df[df["isFraud"] == 1].copy()

plt.figure(figsize=(10, 6))

plt.hist(
    fraud_df["amount"],
    bins=100,
)

plt.title("Distribution of Fraud Transaction Amounts")
plt.xlabel("Transaction Amount")
plt.ylabel("Frequency")

plt.tight_layout()

plt.savefig(
    FIGURES_DIR / "fraud_amount_distribution.png",
    dpi=200,
)

plt.close()


# ============================================================
# 5. BALANCE ERROR ANALYSIS
# ============================================================

print("\n[5/8] Analyzing balance inconsistencies...")

df["orig_balance_error"] = (
    df["oldbalanceOrg"]
    - df["amount"]
    - df["newbalanceOrig"]
).abs()

df["dest_balance_error"] = (
    df["oldbalanceDest"]
    + df["amount"]
    - df["newbalanceDest"]
).abs()

balance_stats = (
    df.groupby("isFraud")[
        [
            "orig_balance_error",
            "dest_balance_error",
        ]
    ]
    .agg([
        "mean",
        "median",
        "max",
    ])
)

balance_stats.to_csv(
    METRICS_DIR / "balance_error_statistics.csv"
)

print(balance_stats)


# ============================================================
# 6. FRAUD OVER TIME
# ============================================================

print("\n[6/8] Analyzing fraud over time...")

fraud_over_time = (
    df.groupby("step")["isFraud"]
    .agg(
        total_transactions="count",
        fraud_transactions="sum",
    )
    .reset_index()
)

fraud_over_time["fraud_rate"] = (
    fraud_over_time["fraud_transactions"]
    / fraud_over_time["total_transactions"]
)

fraud_over_time.to_csv(
    METRICS_DIR / "fraud_over_time.csv",
    index=False
)

plt.figure(figsize=(12, 6))

plt.plot(
    fraud_over_time["step"],
    fraud_over_time["fraud_transactions"],
)

plt.title("Fraud Transactions Over Time")
plt.xlabel("PaySim Step (Hour)")
plt.ylabel("Fraud Transactions")

plt.tight_layout()

plt.savefig(
    FIGURES_DIR / "fraud_over_time.png",
    dpi=200,
)

plt.close()


# ============================================================
# 7. ZERO-BALANCE BEHAVIOR
# ============================================================

print("\n[7/8] Analyzing zero-balance behavior...")

zero_balance_analysis = (
    df.assign(
        origin_zero_after=(
            df["newbalanceOrig"] == 0
        ).astype("int8"),

        destination_zero_before=(
            df["oldbalanceDest"] == 0
        ).astype("int8"),
    )
    .groupby("isFraud")[
        [
            "origin_zero_after",
            "destination_zero_before",
        ]
    ]
    .mean()
    * 100
)

zero_balance_analysis.to_csv(
    METRICS_DIR / "zero_balance_analysis.csv"
)

print(zero_balance_analysis)


# ============================================================
# 8. FRAUD TYPE + AMOUNT ANALYSIS
# ============================================================

print("\n[8/8] Analyzing fraud amount by transaction type...")

fraud_type_amount = (
    fraud_df.groupby("type", observed=True)["amount"]
    .agg([
        "count",
        "mean",
        "median",
        "min",
        "max",
    ])
)

fraud_type_amount.to_csv(
    METRICS_DIR / "fraud_type_amount_statistics.csv"
)

print(fraud_type_amount)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("EDA COMPLETE")
print("=" * 70)

print("\nMetrics saved to:")
print(METRICS_DIR)

print("\nFigures saved to:")
print(FIGURES_DIR)