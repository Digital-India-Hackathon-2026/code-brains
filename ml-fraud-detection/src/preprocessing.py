from pathlib import Path
import pandas as pd
import numpy as np


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

RAW_DATA_PATH = (
    PROJECT_ROOT / "data" / "raw" / "paysim.csv"
)

PROCESSED_DATA_DIR = (
    PROJECT_ROOT / "data" / "processed"
)

PROCESSED_DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# MEMORY-EFFICIENT DTYPES
# ============================================================

DTYPES = {
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


# ============================================================
# LOAD DATASET
# ============================================================

def load_paysim_data():
    """
    Load the complete PaySim dataset using memory-efficient dtypes.
    """

    print("=" * 70)
    print("LOADING PAYSIM DATASET")
    print("=" * 70)

    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at:\n{RAW_DATA_PATH}"
        )

    print(f"\nDataset path:\n{RAW_DATA_PATH}")

    df = pd.read_csv(
        RAW_DATA_PATH,
        dtype=DTYPES
    )

    print("\nDataset loaded successfully.")
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    memory_gb = (
        df.memory_usage(deep=True).sum()
        / 1024 ** 3
    )

    print(
        f"Memory usage: {memory_gb:.2f} GB"
    )

    return df


# ============================================================
# VALIDATE DATASET
# ============================================================

def validate_dataset(df):
    """
    Verify that the expected PaySim columns exist.
    """

    required_columns = {
        "step",
        "type",
        "amount",
        "nameOrig",
        "oldbalanceOrg",
        "newbalanceOrig",
        "nameDest",
        "oldbalanceDest",
        "newbalanceDest",
        "isFraud",
        "isFlaggedFraud",
    }

    missing_columns = (
        required_columns - set(df.columns)
    )

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(missing_columns)
        )

    print("\nDataset validation successful.")

    return True


# ============================================================
# LEAKAGE-SAFE CHRONOLOGICAL SPLIT
# ============================================================

def chronological_split(
    df,
    train_ratio=0.70,
    validation_ratio=0.15,
    test_ratio=0.15,
):
    """
    Create chronological train, validation, and test sets.

    Transactions from the future are never placed into an
    earlier split.

    Important:
    Entire PaySim steps are kept together so transactions from
    the same hour are not divided between different datasets.
    """

    print("\n" + "=" * 70)
    print("CREATING CHRONOLOGICAL SPLITS")
    print("=" * 70)

    total_ratio = (
        train_ratio
        + validation_ratio
        + test_ratio
    )

    if not np.isclose(total_ratio, 1.0):
        raise ValueError(
            "Train, validation and test ratios "
            "must add up to 1.0."
        )

    unique_steps = np.sort(
        df["step"].unique()
    )

    total_steps = len(unique_steps)

    train_end_index = int(
        total_steps * train_ratio
    )

    validation_end_index = int(
        total_steps
        * (
            train_ratio
            + validation_ratio
        )
    )

    train_steps = unique_steps[
        :train_end_index
    ]

    validation_steps = unique_steps[
        train_end_index:
        validation_end_index
    ]

    test_steps = unique_steps[
        validation_end_index:
    ]

    train_df = df[
        df["step"].isin(train_steps)
    ].copy()

    validation_df = df[
        df["step"].isin(validation_steps)
    ].copy()

    test_df = df[
        df["step"].isin(test_steps)
    ].copy()

    print_split_information(
        "TRAIN",
        train_df
    )

    print_split_information(
        "VALIDATION",
        validation_df
    )

    print_split_information(
        "TEST",
        test_df
    )

    # Safety checks

    assert (
        train_df["step"].max()
        < validation_df["step"].min()
    ), "Train/validation leakage detected."

    assert (
        validation_df["step"].max()
        < test_df["step"].min()
    ), "Validation/test leakage detected."

    print(
        "\nChronological leakage checks passed."
    )

    return (
        train_df,
        validation_df,
        test_df,
    )


# ============================================================
# SPLIT INFORMATION
# ============================================================

def print_split_information(
    split_name,
    data
):
    """
    Print information about one dataset split.
    """

    total = len(data)

    fraud_count = int(
        data["isFraud"].sum()
    )

    legitimate_count = (
        total - fraud_count
    )

    fraud_rate = (
        fraud_count / total * 100
        if total > 0
        else 0
    )

    print(
        f"\n{split_name}"
    )

    print("-" * 50)

    print(
        f"Rows: {total:,}"
    )

    print(
        f"Step range: "
        f"{data['step'].min()} "
        f"to "
        f"{data['step'].max()}"
    )

    print(
        f"Legitimate: "
        f"{legitimate_count:,}"
    )

    print(
        f"Fraud: "
        f"{fraud_count:,}"
    )

    print(
        f"Fraud rate: "
        f"{fraud_rate:.6f}%"
    )


# ============================================================
# SELECT MODEL FEATURES
# ============================================================

def prepare_model_data(
    df,
    feature_columns
):
    """
    Separate model features and target.

    Raw account identifiers and leakage columns are excluded
    because only explicitly supplied feature columns are used.
    """

    missing_features = [
        column
        for column in feature_columns
        if column not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Missing model features: "
            + ", ".join(missing_features)
        )

    X = df[
        feature_columns
    ].copy()

    y = df[
        "isFraud"
    ].copy()

    return X, y