import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def investigate_with_llm(evidence_package: dict) -> dict:
    """
    Passes the validated evidence package to Gemini to generate a structured Case Report.
    """
    
    # Strictly adhering to the Agent Prompt Design blueprint
    system_instruction = """
    You are a fraud-triage investigation assistant.
    Use only the supplied evidence.
    Do not invent transactions, accounts, timings or regulations.
    Return valid JSON only matching the investigation output contract.
    Choose exactly one action from: ALLOW, MONITOR, HOLD, ESCALATE, HOLD_AND_ESCALATE.
    Explain the recommendation using concise evidence-based language.
    If evidence is insufficient, prefer MONITOR or ESCALATE for human review rather than claiming certainty.
    """
    
    # Using Gemini 1.5 Flash for high-speed hackathon responses
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=system_instruction
    )
    
    # We force the model to return raw JSON so our FastAPI endpoints don't crash
    response = model.generate_content(
        json.dumps(evidence_package),
        generation_config={"response_mime_type": "application/json"}
    )
    
    # Parse the string response back into a Python dictionary
    return json.loads(response.text)