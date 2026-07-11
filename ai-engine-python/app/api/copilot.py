import os

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class CopilotRequest(BaseModel):
    message: str


class CopilotResponse(BaseModel):
    content: str


@router.post("/api/copilot", response_model=CopilotResponse)
def copilot(payload: CopilotRequest):
    """
    Plain-text Gemini generation used by the frontend's SAR narrative
    drafting button (SarReportView.jsx -> Spring Boot -> here).
    Unlike /api/investigations, this returns free text, not forced JSON.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.startswith("REPLACE_ME"):
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured. Set it in ai-engine-python/.env",
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(payload.message)
        return CopilotResponse(content=response.text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {str(e)}")
