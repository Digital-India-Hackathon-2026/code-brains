import json
from pathlib import Path

import numpy as np

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent

PROBABILITIES_PATH = (
    PROJECT_ROOT
    / "models"
    / "validation_probabilities.npz"
)

OUTPUT_PATH = (
    PROJECT_ROOT
    / "models"
    / "threshold.json"
)

METRICS_PATH = (
    PROJECT_ROOT
    / "reports"
    / "metrics"
    / "threshold_tuning_results.json"
)


def calculate_metrics(
    labels,
    probabilities,
    threshold,
):
    predictions = (
        probabilities >= threshold
    ).astype(int)

    precision = precision_score(
        labels,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        labels,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        labels,
        predictions,
        zero_division=0,
    )

    tn, fp, fn, tp = confusion_matrix(
        labels,
        predictions,
        labels=[0, 1],
    ).ravel()

    return {
        "threshold": float(threshold),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
    }


def main():

    print("=" * 70)
    print("XGBOOST PROBABILITY THRESHOLD TUNING")
    print("=" * 70)

    data = np.load(PROBABILITIES_PATH)

    probabilities = data["probabilities"]
    labels = data["labels"]

    print(f"\nValidation rows: {len(labels):,}")
    print(f"Fraud cases: {int(labels.sum()):,}")

    # Test a wide threshold range.
    thresholds = np.concatenate([
        np.arange(0.01, 0.10, 0.01),
        np.arange(0.10, 0.91, 0.01),
        np.arange(0.92, 1.00, 0.01),
    ])

    results = []

    for threshold in thresholds:
        result = calculate_metrics(
            labels,
            probabilities,
            threshold,
        )

        results.append(result)

    # Our operational requirement:
    # Prefer thresholds maintaining at least 95% fraud recall.
    eligible_results = [
        result
        for result in results
        if result["recall"] >= 0.95
    ]

    if not eligible_results:
        raise ValueError(
            "No threshold achieved minimum 95% recall."
        )

    # Primary objective:
    # 1. Minimize false positives
    # 2. Maximize F1
    # 3. Maximize recall
    best_result = min(
        eligible_results,
        key=lambda result: (
            result["false_positives"],
            -result["f1_score"],
            -result["recall"],
        ),
    )

    print("\n" + "=" * 70)
    print("SELECTED THRESHOLD")
    print("=" * 70)

    print(
        f"\nThreshold       : "
        f"{best_result['threshold']:.4f}"
    )

    print(
        f"Precision       : "
        f"{best_result['precision']:.6f}"
    )

    print(
        f"Recall          : "
        f"{best_result['recall']:.6f}"
    )

    print(
        f"F1 Score        : "
        f"{best_result['f1_score']:.6f}"
    )

    print(
        f"False Positives : "
        f"{best_result['false_positives']:,}"
    )

    print(
        f"False Negatives : "
        f"{best_result['false_negatives']:,}"
    )

    print(
        f"True Positives  : "
        f"{best_result['true_positives']:,}"
    )

    threshold_artifact = {
        "fraud_threshold": best_result["threshold"],
        "minimum_recall_requirement": 0.95,
        "selection_strategy": (
            "Minimize false positives among thresholds "
            "with recall >= 95%; then maximize F1 and recall."
        ),
    }

    with open(OUTPUT_PATH, "w") as file:
        json.dump(
            threshold_artifact,
            file,
            indent=4,
        )

    METRICS_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output = {
        "selected_threshold": best_result,
        "all_threshold_results": results,
    }

    with open(METRICS_PATH, "w") as file:
        json.dump(
            output,
            file,
            indent=4,
        )

    print("\nThreshold saved to:")
    print(OUTPUT_PATH)

    print("\nDetailed results saved to:")
    print(METRICS_PATH)


if __name__ == "__main__":
    main()