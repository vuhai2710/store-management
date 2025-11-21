from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommend_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Product Recommender Service")

# Enable CORS - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recommend_router.router, tags=["recommendations"])

@app.get("/")
def root():
    return {"message": "Product Recommender Service", "status": "running"}

@app.get("/health")
def health():
    """Health check endpoint"""
    try:
        from modules import loader
        conn = loader.get_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)

# python -m uvicorn app:app --reload --port 5000