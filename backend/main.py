"""
Restaurant Analytics API - FastAPI Backend
"""
import time
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from database import get_db, serialize_rows, test_connection
from queries import GET_STORES_QUERY, GET_CHANNELS_QUERY
from routes import api_router
from cache import clear_cache


# Create FastAPI app
app = FastAPI(
    title="Restaurant Analytics API",
    description="Analytics API for restaurant operations data",
    version="1.0.0"
)

# CORS middleware - permite frontend acessar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção: especifique os domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Restaurant Analytics API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "overview": "/api/overview",
            "sales": "/api/sales/*",
            "products": "/api/products/*",
            "filters": "/api/filters/*"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    """Check if API and database are healthy"""
    db_status = test_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected"
    }
# Cache management
@app.post("/api/cache/clear")
async def clear_cache_endpoint():
    """Clear all API cache"""
    clear_cache()
    return {
        "status": "success",
        "message": "Cache cleared successfully",
        "timestamp": time.time()
    }
# Filters endpoints (for dropdowns)
@app.get("/api/filters/stores")
async def get_stores():
    """Get all stores for filter dropdown"""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_STORES_QUERY)
            results = serialize_rows(cur.fetchall())
            return {"data": results}

@app.get("/api/filters/channels")
async def get_channels():
    """Get all channels for filter dropdown"""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_CHANNELS_QUERY)
            results = serialize_rows(cur.fetchall())
            return {"data": results}

@app.get("/api/stores/performance")
async def get_stores_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Get stores performance ranking"""
    from queries import get_stores_performance_query
    
    filters = {
        "start_date": start_date,
        "end_date": end_date
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_stores_performance_query(filters, limit)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "total_records": len(results)
            }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on API startup"""
    print("=" * 60)
    print("🚀 Restaurant Analytics API Starting...")
    print("=" * 60)
    
    # Test database connection
    if test_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")
        print("⚠️  Check your database configuration")
    
    print("=" * 60)
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("=" * 60)

# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )