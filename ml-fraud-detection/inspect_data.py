import pandas as pd
import os

CSV_PATH = "data/raw/paysim.csv"
print("=" * 70)
print("PAYSIM DATASET INSPECTION")
print("=" * 70)

# Check whether file exists
if not os.path.exists(CSV_PATH):
    print(f"\nERROR: File not found at: {CSV_PATH}")
    print("Place your PaySim CSV inside data/raw/ and rename it to paysim.csv")
    exit()

# Get file size
size_gb = os.path.getsize(CSV_PATH) / (1024 ** 3)
print(f"\nFile size: {size_gb:.2f} GB")

print("\nLoading dataset...")
df = pd.read_csv(CSV_PATH)

print("\n1. DATASET SHAPE")
print("-" * 50)
print(f"Rows    : {df.shape[0]:,}")
print(f"Columns : {df.shape[1]}")

print("\n2. COLUMN NAMES")
print("-" * 50)
for i, column in enumerate(df.columns, 1):
    print(f"{i}. {column}")

print("\n3. DATA TYPES")
print("-" * 50)
print(df.dtypes)

print("\n4. FIRST 5 ROWS")
print("-" * 50)
print(df.head().to_string())

print("\n5. MISSING VALUES")
print("-" * 50)
print(df.isnull().sum())

print("\n6. UNIQUE VALUES")
print("-" * 50)
for column in df.columns:
    print(f"{column}: {df[column].nunique():,}")

if "isFraud" in df.columns:
    print("\n7. FRAUD DISTRIBUTION")
    print("-" * 50)

    fraud_counts = df["isFraud"].value_counts()
    fraud_percentage = df["isFraud"].value_counts(normalize=True) * 100

    print(fraud_counts)
    print("\nPercentages:")
    print(fraud_percentage)

if "type" in df.columns and "isFraud" in df.columns:
    print("\n8. FRAUD BY TRANSACTION TYPE")
    print("-" * 50)

    fraud_by_type = pd.crosstab(
        df["type"],
        df["isFraud"],
        margins=True
    )

    print(fraud_by_type)

    print("\nFraud rate by transaction type:")

    fraud_rate = (
        df.groupby("type")["isFraud"]
        .agg(["count", "sum", "mean"])
        .sort_values("mean", ascending=False)
    )

    fraud_rate["mean"] *= 100
    fraud_rate.rename(
        columns={
            "count": "total_transactions",
            "sum": "fraud_transactions",
            "mean": "fraud_rate_percent"
        },
        inplace=True
    )

    print(fraud_rate)

if "isFlaggedFraud" in df.columns:
    print("\n9. FLAGGED FRAUD DISTRIBUTION")
    print("-" * 50)
    print(df["isFlaggedFraud"].value_counts())

print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)