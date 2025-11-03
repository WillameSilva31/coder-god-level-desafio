"""
Products routes - Products and items analysis
"""
from fastapi import APIRouter, Query
from typing import Optional

from cache import cache_response
from database import get_db, serialize_rows
from queries import (
    get_top_products_query,
    get_top_items_query,
    get_stores_performance_query
)

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/top-products")
@cache_response(ttl=300)
async def get_top_products(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get top selling products
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_top_products_query(filters, limit)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "total_records": len(results)
            }

@router.get("/top-items")
async def get_top_items(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(15, ge=1, le=100)
):
    """
    Get top customizations/items added
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_top_items_query(filters, limit)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "total_records": len(results)
            }