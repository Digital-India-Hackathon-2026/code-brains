import pandas as pd
from datetime import datetime, timedelta

def analyze_behavior(current_tx: dict, account_history: list) -> dict:
    """
    Analyzes historical transactions to detect mule behavior patterns.
    Returns a list of detected patterns and specific evidence strings for the AI.
    """
    detected_patterns = []
    evidence = []
    
    # If there's no history, we can't do behavioral analysis safely
    if not account_history:
        return {"patterns": detected_patterns, "evidence": evidence}
        
    # Convert history into a Pandas DataFrame for rapid calculation
    df = pd.DataFrame(account_history)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    current_time = pd.to_datetime(current_tx['timestamp'])
    current_amount = float(current_tx['amount'])
    
    # ---------------------------------------------------------
    # RULE 1: HIGH_TRANSACTION_VELOCITY
    # Threshold: More than 5 transactions in the last 24 hours
    # ---------------------------------------------------------
    time_window = current_time - timedelta(hours=24)
    recent_txs = df[df['timestamp'] >= time_window]
    
    if len(recent_txs) > 5:
        detected_patterns.append("HIGH_TRANSACTION_VELOCITY")
        evidence.append(f"Account performed {len(recent_txs)} transactions in a 24-hour window.")

    # ---------------------------------------------------------
    # RULE 2: RAPID_PASS_THROUGH
    # Threshold: Large deposit followed by withdrawal within 2 hours
    # ---------------------------------------------------------
    # Find recent large deposits (e.g., > 80% of current outbound amount)
    recent_deposits = recent_txs[
        (recent_txs['transaction_type'] == 'DEPOSIT') & 
        (recent_txs['amount'] >= (current_amount * 0.8))
    ]
    
    if not recent_deposits.empty:
        # Check if the deposit happened within 2 hours of this current transfer
        deposit_time = recent_deposits.iloc[-1]['timestamp']
        time_diff = (current_time - deposit_time).total_seconds() / 3600 # in hours
        
        if time_diff <= 2:
            detected_patterns.append("RAPID_PASS_THROUGH")
            evidence.append(f"Funds transferred out {round(time_diff, 1)} hours after a large deposit.")
            
    # ---------------------------------------------------------
    # RULE 3: UNUSUAL_AMOUNT
    # Threshold: Current amount is 3x the historical average
    # ---------------------------------------------------------
    avg_amount = df['amount'].mean()
    if current_amount > (avg_amount * 3):
        detected_patterns.append("UNUSUAL_AMOUNT")
        evidence.append(f"Transaction amount ({current_amount}) is significantly higher than historical average ({round(avg_amount, 2)}).")

    return {
        "patterns": detected_patterns,
        "evidence": evidence
    }