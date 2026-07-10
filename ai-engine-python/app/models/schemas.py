from pydantic import BaseModel
from typing import List, Optional

# Input Contract from ML / Transaction Pipeline (Blueprint Section 7)
class TransactionInput(BaseModel):
    transaction_id: str
    sender_account: str
    receiver_account: str
    amount: float
    currency: str
    transaction_type: str
    timestamp: str
    fraud_probability: float
    risk_level: str
    detected_patterns: List[str]
    recommended_action: str

# AI Investigation Output Contract (Blueprint Section 8)
class InvestigationOutput(BaseModel):
    investigation_id: str
    transaction_id: str
    account_id: str
    status: str
    ml_risk_score: float
    risk_level: str
    evidence: List[str]
    connected_accounts: List[str]
    ai_explanation: str
    confidence: float
    recommended_action: str
    created_at: str