from preprocessing import (
    load_paysim_data,
    validate_dataset,
    chronological_split,
)


def main():
    print("=" * 70)
    print("TESTING PREPROCESSING PIPELINE")
    print("=" * 70)

    # Step 1: Load the complete PaySim dataset
    df = load_paysim_data()

    # Step 2: Validate expected columns
    validate_dataset(df)

    # Step 3: Create leakage-safe chronological splits
    train_df, validation_df, test_df = chronological_split(df)

    print("\n" + "=" * 70)
    print("PREPROCESSING TEST COMPLETE")
    print("=" * 70)

    print("\nFinal split sizes:")
    print(f"Train      : {len(train_df):,} rows")
    print(f"Validation : {len(validation_df):,} rows")
    print(f"Test       : {len(test_df):,} rows")


if __name__ == "__main__":
    main()