import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    average_precision_score,
    roc_auc_score,
)

from preprocessing import (
    load_paysim_data,
    validate_dataset,
    chronological_split,
)

from feature_engineering import (
    create_transaction_features,
    get_transaction_feature_columns,
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODELS_DIR = PROJECT_ROOT / "models"
METRICS_DIR = PROJECT_ROOT / "reports" / "metrics"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# MAIN TRAINING FUNCTION
# ============================================================

def main():

    print("=" * 70)
    print("TRAINING BASELINE FRAUD DETECTION MODEL")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    df = load_paysim_data()

    validate_dataset(df)

    # --------------------------------------------------------
    # 2. Chronological split BEFORE feature engineering
    # --------------------------------------------------------

    train_df, validation_df, test_df = chronological_split(df)

    # We don't need the full original DataFrame anymore.
    del df

    print("\nCreating transaction-level features...")

    train_df = create_transaction_features(train_df)
    validation_df = create_transaction_features(validation_df)

    # Test set is deliberately untouched during model training.
    # We'll use it only after model and threshold selection.

    feature_columns = get_transaction_feature_columns()

    print(f"\nNumber of model features: {len(feature_columns)}")

    for feature in feature_columns:
        print(f" - {feature}")

    # --------------------------------------------------------
    # 3. Prepare train and validation data
    # --------------------------------------------------------

    X_train = train_df[feature_columns].copy()
    y_train = train_df["isFraud"].copy()

    X_validation = validation_df[feature_columns].copy()
    y_validation = validation_df["isFraud"].copy()

    print("\nTraining data:")
    print(f"Rows: {len(X_train):,}")
    print(f"Fraud cases: {int(y_train.sum()):,}")

    print("\nValidation data:")
    print(f"Rows: {len(X_validation):,}")
    print(f"Fraud cases: {int(y_validation.sum()):,}")

    # --------------------------------------------------------
    # 4. Clean infinity / NaN
    # --------------------------------------------------------

    X_train = X_train.replace(
        [np.inf, -np.inf],
        np.nan
    ).fillna(0)

    X_validation = X_validation.replace(
        [np.inf, -np.inf],
        np.nan
    ).fillna(0)

    # --------------------------------------------------------
    # 5. Scale features
    # --------------------------------------------------------

    print("\nScaling features...")

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)

    X_validation_scaled = scaler.transform(X_validation)

    # --------------------------------------------------------
    # 6. Train Logistic Regression baseline
    # --------------------------------------------------------

    print("\nTraining Logistic Regression baseline...")

    model = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        solver="liblinear",
        random_state=42,
    )

    model.fit(
        X_train_scaled,
        y_train
    )

    print("Baseline training complete.")

    # --------------------------------------------------------
    # 7. Validation probabilities
    # --------------------------------------------------------

    validation_probabilities = model.predict_proba(
        X_validation_scaled
    )[:, 1]

    # Initial default threshold
    threshold = 0.5

    validation_predictions = (
        validation_probabilities >= threshold
    ).astype(int)

    # --------------------------------------------------------
    # 8. Calculate metrics
    # --------------------------------------------------------

    precision = precision_score(
        y_validation,
        validation_predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_validation,
        validation_predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_validation,
        validation_predictions,
        zero_division=0,
    )

    pr_auc = average_precision_score(
        y_validation,
        validation_probabilities,
    )

    roc_auc = roc_auc_score(
        y_validation,
        validation_probabilities,
    )

    tn, fp, fn, tp = confusion_matrix(
        y_validation,
        validation_predictions,
        labels=[0, 1],
    ).ravel()

    false_positive_rate = (
        fp / (fp + tn)
        if (fp + tn) > 0
        else 0
    )

    # --------------------------------------------------------
    # 9. Display results
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("BASELINE VALIDATION RESULTS")
    print("=" * 70)

    print(f"\nThreshold : {threshold:.2f}")
    print(f"Precision : {precision:.6f}")
    print(f"Recall    : {recall:.6f}")
    print(f"F1 Score  : {f1:.6f}")
    print(f"PR-AUC    : {pr_auc:.6f}")
    print(f"ROC-AUC   : {roc_auc:.6f}")

    print("\nConfusion Matrix:")
    print(f"True Negatives  : {tn:,}")
    print(f"False Positives : {fp:,}")
    print(f"False Negatives : {fn:,}")
    print(f"True Positives  : {tp:,}")

    print(
        f"\nFalse Positive Rate: "
        f"{false_positive_rate * 100:.6f}%"
    )

    print("\nClassification Report:")
    print(
        classification_report(
            y_validation,
            validation_predictions,
            digits=6,
            zero_division=0,
        )
    )

    # --------------------------------------------------------
    # 10. Save metrics
    # --------------------------------------------------------

    metrics = {
        "model": "LogisticRegression",
        "threshold": threshold,
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "pr_auc": float(pr_auc),
        "roc_auc": float(roc_auc),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "false_positive_rate": float(false_positive_rate),
        "number_of_features": len(feature_columns),
        "feature_columns": feature_columns,
    }

    metrics_path = (
        METRICS_DIR / "baseline_validation_metrics.json"
    )

    with open(metrics_path, "w") as file:
        json.dump(metrics, file, indent=4)

    # --------------------------------------------------------
    # 11. Save baseline artifacts
    # --------------------------------------------------------

    joblib.dump(
        model,
        MODELS_DIR / "baseline_logistic_regression.joblib"
    )

    joblib.dump(
        scaler,
        MODELS_DIR / "baseline_scaler.joblib"
    )

    with open(
        MODELS_DIR / "baseline_feature_columns.json",
        "w",
    ) as file:
        json.dump(feature_columns, file, indent=4)

    print("\n" + "=" * 70)
    print("BASELINE PIPELINE COMPLETE")
    print("=" * 70)

    print(f"\nMetrics saved to:\n{metrics_path}")

    print(
        "\nModel saved to:\n"
        f"{MODELS_DIR / 'baseline_logistic_regression.joblib'}"
    )

    print(
        "\nScaler saved to:\n"
        f"{MODELS_DIR / 'baseline_scaler.joblib'}"
    )


if __name__ == "__main__":
    main()