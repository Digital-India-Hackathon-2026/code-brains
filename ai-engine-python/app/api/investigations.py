from fastapi import APIRouter, HTTPException
from app.models.schemas import InvestigationOutput
from app.services.investigator import investigate_with_llm
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/api/investigations", response_model=InvestigationOutput)
def start_ai_investigation(evidence_package: dict):
    try:
      
        ai_result = investigate_with_llm(evidence_package)
        
      
        ai_result["investigation_id"] = f"INV-{uuid.uuid4().hex[:6].upper()}"
        ai_result["status"] = "COMPLETED"
        ai_result["created_at"] = datetime.now().isoformat()
        
        return ai_result
        
    except Exception as e:
     
        raise HTTPException(
            status_code=503, 
            detail=f"AI Investigation failed. Fallback triggered: {str(e)}"
        )
