from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import investigations, copilot

app = FastAPI(
    title="MuleGuard AI Engine",
    description="Microservice for transaction analysis and AI investigation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our new investigations router
app.include_router(investigations.router)
app.include_router(copilot.router)

@app.get("/api/health")
def health_check():
    return {"status": "AI Engine Microservice is running securely"}