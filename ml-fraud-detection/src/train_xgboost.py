import json
import time
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
# EVALUATION FUNCTION
# ============================================================

def evaluate_model(
    y_true,
    probabilities,
    threshold=0.5,
):
    predictions = (
        probabilities >= threshold
    ).astype(int)

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0,
    )

    pr_auc = average_precision_score(
        y_true,
        probabilities,
    )

    roc_auc = roc_auc_score(
        y_true,
        probabilities,
    )

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    ).ravel()

    false_positive_rate = (
        fp / (fp + tn)
        if (fp + tn) > 0
        else 0
    )

    return {
        "threshold": float(threshold),
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
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("TRAINING XGBOOST FRAUD DETECTION MODEL")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    df = load_paysim_data()

    validate_dataset(df)

    # --------------------------------------------------------
    # 2. Chronological split
    # --------------------------------------------------------

    train_df, validation_df, test_df = (
        chronological_split(df)
    )

    del df

    print("\nCreating transaction features...")

    train_df = create_transaction_features(
        train_df
    )

    validation_df = create_transaction_features(
        validation_df
    )

    # Do not use test_df during training or threshold selection.

    feature_columns = (
        get_transaction_feature_columns()
    )

    print(
        f"\nNumber of features: "
        f"{len(feature_columns)}"
    )

    # --------------------------------------------------------
    # 3. Prepare matrices
    # --------------------------------------------------------

    X_train = train_df[
        feature_columns
    ].replace(
        [np.inf, -np.inf],
        np.nan,
    ).fillna(0)

    y_train = train_df[
        "isFraud"
    ]

    X_validation = validation_df[
        feature_columns
    ].replace(
        [np.inf, -np.inf],
        np.nan,
    ).fillna(0)

    y_validation = validation_df[
        "isFraud"
    ]

    print("\nTraining data:")
    print(f"Rows: {len(X_train):,}")
    print(
        f"Fraud cases: "
        f"{int(y_train.sum()):,}"
    )

    print("\nValidation data:")
    print(
        f"Rows: {len(X_validation):,}"
    )
    print(
        f"Fraud cases: "
        f"{int(y_validation.sum()):,}"
    )

    # --------------------------------------------------------
    # 4. Calculate imbalance ratio
    # --------------------------------------------------------

    negative_count = int(
        (y_train == 0).sum()
    )

    positive_count = int(
        (y_train == 1).sum()
    )

    scale_pos_weight = (
        negative_count / positive_count
    )

    print(
        "\nClass imbalance ratio "
        f"(negative / positive): "
        f"{scale_pos_weight:.2f}"
    )

    # --------------------------------------------------------
    # 5. Model parameters
    # --------------------------------------------------------

    common_params = {
        "n_estimators": 500,
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_weight": 5,
        "gamma": 0.1,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "scale_pos_weight": scale_pos_weight,
        "objective": "binary:logistic",
        "eval_metric": "aucpr",
        "random_state": 42,
        "n_jobs": -1,
    }

    # --------------------------------------------------------
    # 6. Try GPU first
    # --------------------------------------------------------

    print("\nAttempting GPU training...")

    try:

        model = xgb.XGBClassifier(
            **common_params,
            tree_method="hist",
            device="cuda",
        )

        start_time = time.time()

        model.fit(
            X_train,
            y_train,
            eval_set=[
                (
                    X_validation,
                    y_validation,
                )
            ],
            verbose=50,
        )

        device_used = "cuda"

        print(
            "\nGPU training completed successfully."
        )

    except Exception as gpu_error:

        print("\nGPU training failed.")
        print(
            f"Reason: {gpu_error}"
        )

        print(
            "\nFalling back to CPU training..."
        )

        model = xgb.XGBClassifier(
            **common_params,
            tree_method="hist",
            device="cpu",
        )

        start_time = time.time()

        model.fit(
            X_train,
            y_train,
            eval_set=[
                (
                    X_validation,
                    y_validation,
                )
            ],
            verbose=50,
        )

        device_used = "cpu"

        print(
            "\nCPU training completed successfully."
        )

    training_time = (
        time.time() - start_time
    )

    # --------------------------------------------------------
    # 7. Validation probabilities
    # --------------------------------------------------------

    print(
        "\nGenerating validation probabilities..."
    )

    validation_probabilities = (
        model.predict_proba(
            X_validation
        )[:, 1]
    )

    # --------------------------------------------------------
    # 8. Evaluate default threshold
    # --------------------------------------------------------

    threshold = 0.5

    metrics = evaluate_model(
        y_validation,
        validation_probabilities,
        threshold,
    )

    metrics.update({
        "model": "XGBoost",
        "device_used": device_used,
        "training_time_seconds": float(
            training_time
        ),
        "number_of_features": len(
            feature_columns
        ),
        "feature_columns": feature_columns,
        "scale_pos_weight": float(
            scale_pos_weight
        ),
    })

    # --------------------------------------------------------
    # 9. Display results
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("XGBOOST VALIDATION RESULTS")
    print("=" * 70)

    print(
        f"\nDevice used : {device_used}"
    )

    print(
        f"Training time: "
        f"{training_time:.2f} seconds"
    )

    print(
        f"\nThreshold : "
        f"{metrics['threshold']:.2f}"
    )

    print(
        f"Precision : "
        f"{metrics['precision']:.6f}"
    )

    print(
        f"Recall    : "
        f"{metrics['recall']:.6f}"
    )

    print(
        f"F1 Score  : "
        f"{metrics['f1_score']:.6f}"
    )

    print(
        f"PR-AUC    : "
        f"{metrics['pr_auc']:.6f}"
    )

    print(
        f"ROC-AUC   : "
        f"{metrics['roc_auc']:.6f}"
    )

    print("\nConfusion Matrix:")

    print(
        f"True Negatives  : "
        f"{metrics['true_negatives']:,}"
    )

    print(
        f"False Positives : "
        f"{metrics['false_positives']:,}"
    )

    print(
        f"False Negatives : "
        f"{metrics['false_negatives']:,}"
    )

    print(
        f"True Positives  : "
        f"{metrics['true_positives']:,}"
    )

    print(
        "\nFalse Positive Rate: "
        f"{metrics['false_positive_rate'] * 100:.6f}%"
    )

    predictions = (
        validation_probabilities
        >= threshold
    ).astype(int)

    print("\nClassification Report:")

    print(
        classification_report(
            y_validation,
            predictions,
            digits=6,
            zero_division=0,
        )
    )

    # --------------------------------------------------------
    # 10. Save metrics
    # --------------------------------------------------------

    metrics_path = (
        METRICS_DIR
        / "xgboost_validation_metrics.json"
    )

    with open(
        metrics_path,
        "w"
    ) as file:

        json.dump(
            metrics,
            file,
            indent=4,
        )

    # --------------------------------------------------------
    # 11. Save model
    # --------------------------------------------------------

    model_path = (
        MODELS_DIR
        / "xgboost_fraud_model.json"
    )

    model.save_model(model_path)

    # --------------------------------------------------------
    # 12. Save feature columns
    # --------------------------------------------------------

    feature_path = (
        MODELS_DIR
        / "xgboost_feature_columns.json"
    )

    with open(
        feature_path,
        "w"
    ) as file:

        json.dump(
            feature_columns,
            file,
            indent=4,
        )

    # --------------------------------------------------------
    # 13. Save validation probabilities
    # --------------------------------------------------------

    probabilities_path = (
        MODELS_DIR
        / "validation_probabilities.npz"
    )

    np.savez_compressed(
        probabilities_path,
        probabilities=validation_probabilities,
        labels=y_validation.to_numpy(),
    )

    print("\n" + "=" * 70)
    print("XGBOOST TRAINING COMPLETE")
    print("=" * 70)

    print(
        f"\nModel saved to:\n{model_path}"
    )

    print(
        f"\nMetrics saved to:\n{metrics_path}"
    )

    print(
        "\nValidation probabilities saved to:\n"
        f"{probabilities_path}"
    )


if __name__ == "__main__":
    main()