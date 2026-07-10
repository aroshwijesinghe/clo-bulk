from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.routers import campaigns, orders

load_dotenv()

app = FastAPI(title="BulkThreads API", description="FastAPI Backend for BulkThreads")

# Setup CORS
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(campaigns.router)
app.include_router(orders.router)

@app.get("/api/health")
def health_check():
    from datetime import datetime
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
