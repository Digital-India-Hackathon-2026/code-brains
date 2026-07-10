import json
from pathlib import Path

import numpy as np
import xgboost as xgb

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    average_precision_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

from preprocessing import (
    load_paysim_data,
    validate_dataset,
    chronological_split,
)

from feature_engineering import (
    create_transaction_features,
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODELS_DIR = PROJECT_ROOT / "models"

METRICS_DIR = PROJECT_ROOT / "reports" / "metrics"

MODEL_PATH = (
    MODELS_DIR / "xgboost_fraud_model.json"
)

THRESHOLD_PATH = (
    MODELS_DIR / "threshold.json"
)

FEATURES_PATH = (
    MODELS_DIR / "xgboost_feature_columns.json"
)

OUTPUT_PATH = (
    METRICS_DIR / "final_test_metrics.json"
)


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("FINAL UNTOUCHED TEST SET EVALUATION")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Verify required artifacts
    # --------------------------------------------------------

    required_files = [
        MODEL_PATH,
        THRESHOLD_PATH,
        FEATURES_PATH,
    ]

    for path in required_files:

        if not path.exists():

            raise FileNotFoundError(
                f"Required artifact not found:\n{path}"
            )

    print("\nAll required model artifacts found.")

    # --------------------------------------------------------
    # 2. Load selected threshold
    # --------------------------------------------------------

    with open(
        THRESHOLD_PATH,
        "r"
    ) as file:

        threshold_data = json.load(file)

    threshold = float(
        threshold_data["fraud_threshold"]
    )

    print(
        f"\nSelected fraud threshold: "
        f"{threshold:.4f}"
    )

    # --------------------------------------------------------
    # 3. Load exact feature columns
    # --------------------------------------------------------

    with open(
        FEATURES_PATH,
        "r"
    ) as file:

        feature_columns = json.load(file)

    print(
        f"Number of model features: "
        f"{len(feature_columns)}"
    )

    # --------------------------------------------------------
    # 4. Load trained XGBoost model
    # --------------------------------------------------------

    print("\nLoading trained XGBoost model...")

    model = xgb.XGBClassifier()

    model.load_model(MODEL_PATH)

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # 5. Load PaySim dataset
    # --------------------------------------------------------

    df = load_paysim_data()

    validate_dataset(df)

    # --------------------------------------------------------
    # 6. Recreate exact chronological split
    # --------------------------------------------------------

    print(
        "\nRecreating leakage-safe "
        "chronological split..."
    )

    train_df, validation_df, test_df = (
        chronological_split(df)
    )

    # Immediately delete datasets we must not use.
    del df
    del train_df
    del validation_df

    print("\nUntouched test set isolated.")

    print(
        f"Test rows: {len(test_df):,}"
    )

    print(
        f"Test fraud cases: "
        f"{int(test_df['isFraud'].sum()):,}"
    )

    # --------------------------------------------------------
    # 7. Engineer transaction features
    # --------------------------------------------------------

    print(
        "\nCreating transaction-level "
        "features for test set..."
    )

    test_df = create_transaction_features(
        test_df
    )

    # --------------------------------------------------------
    # 8. Prepare test features and labels
    # --------------------------------------------------------

    X_test = (
        test_df[feature_columns]
        .replace(
            [np.inf, -np.inf],
            np.nan,
        )
        .fillna(0)
    )

    y_test = test_df["isFraud"].copy()

    print(
        f"\nX_test shape: {X_test.shape}"
    )

    # --------------------------------------------------------
    # 9. Generate fraud probabilities
    # --------------------------------------------------------

    print(
        "\nGenerating fraud probabilities..."
    )

    probabilities = (
        model.predict_proba(X_test)[:, 1]
    )

    predictions = (
        probabilities >= threshold
    ).astype(int)

    # --------------------------------------------------------
    # 10. Calculate final metrics
    # --------------------------------------------------------

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0,
    )

    pr_auc = average_precision_score(
        y_test,
        probabilities,
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities,
    )

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1],
    ).ravel()

    false_positive_rate = (
        fp / (fp + tn)
        if (fp + tn) > 0
        else 0.0
    )

    # --------------------------------------------------------
    # 11. Display final results
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("FINAL TEST RESULTS")
    print("=" * 70)

    print(
        f"\nThreshold : {threshold:.4f}"
    )

    print(
        f"Precision : {precision:.6f}"
    )

    print(
        f"Recall    : {recall:.6f}"
    )

    print(
        f"F1 Score  : {f1:.6f}"
    )

    print(
        f"PR-AUC    : {pr_auc:.6f}"
    )

    print(
        f"ROC-AUC   : {roc_auc:.6f}"
    )

    print("\nConfusion Matrix:")

    print(
        f"True Negatives  : {tn:,}"
    )

    print(
        f"False Positives : {fp:,}"
    )

    print(
        f"False Negatives : {fn:,}"
    )

    print(
        f"True Positives  : {tp:,}"
    )

    print(
        "\nFalse Positive Rate: "
        f"{false_positive_rate * 100:.6f}%"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            digits=6,
            zero_division=0,
        )
    )

    # --------------------------------------------------------
    # 12. Probability diagnostics
    # --------------------------------------------------------

    fraud_probabilities = probabilities[
        y_test.to_numpy() == 1
    ]

    legitimate_probabilities = probabilities[
        y_test.to_numpy() == 0
    ]

    print("\nProbability Diagnostics:")

    print(
        "Fraud probability range:"
    )

    print(
        f"  Min    : "
        f"{fraud_probabilities.min():.8f}"
    )

    print(
        f"  Median : "
        f"{np.median(fraud_probabilities):.8f}"
    )

    print(
        f"  Max    : "
        f"{fraud_probabilities.max():.8f}"
    )

    print(
        "\nLegitimate probability range:"
    )

    print(
        f"  Min    : "
        f"{legitimate_probabilities.min():.8f}"
    )

    print(
        f"  Median : "
        f"{np.median(legitimate_probabilities):.8f}"
    )

    print(
        f"  Max    : "
        f"{legitimate_probabilities.max():.8f}"
    )

    # --------------------------------------------------------
    # 13. Save final metrics
    # --------------------------------------------------------

    final_metrics = {
        "model": "XGBoost",
        "evaluation_set": (
            "untouched_chronological_test_set"
        ),
        "threshold": float(threshold),
        "test_rows": int(len(y_test)),
        "fraud_cases": int(y_test.sum()),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "pr_auc": float(pr_auc),
        "roc_auc": float(roc_auc),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "false_positive_rate": float(
            false_positive_rate
        ),
        "fraud_probability_min": float(
            fraud_probabilities.min()
        ),
        "fraud_probability_median": float(
            np.median(fraud_probabilities)
        ),
        "fraud_probability_max": float(
            fraud_probabilities.max()
        ),
        "legitimate_probability_min": float(
            legitimate_probabilities.min()
        ),
        "legitimate_probability_median": float(
            np.median(
                legitimate_probabilities
            )
        ),
        "legitimate_probability_max": float(
            legitimate_probabilities.max()
        ),
        "number_of_features": len(
            feature_columns
        ),
        "feature_columns": feature_columns,
    }

    METRICS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        OUTPUT_PATH,
        "w"
    ) as file:

        json.dump(
            final_metrics,
            file,
            indent=4,
        )

    print("\n" + "=" * 70)
    print("FINAL TEST EVALUATION COMPLETE")
    print("=" * 70)

    print(
        f"\nFinal metrics saved to:\n"
        f"{OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()