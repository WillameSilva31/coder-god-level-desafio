from fastapi import APIRouter, Query
from typing import Optional

from cache import cache_response
from database import get_db, serialize_rows
from queries import (
    get_sales_by_date_query,
    get_sales_by_hour_query,
    get_sales_by_weekday_query,
    get_sales_by_channel_query
)

router = APIRouter(prefix="/api/sales", tags=["Sales"])

@router.get("/by-date")
@cache_response(ttl=300)
async def get_sales_by_date(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    group_by: str = Query("day", regex="^(day|week|month)$")
):
    """
    Get sales aggregated by time period
    
    Parameters:
    - group_by: day, week, or month
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_sales_by_date_query(filters, group_by)
            print("DEBUG QUERY:", query)
            print("DEBUG PARAMS:", params)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "group_by": group_by,
                "total_records": len(results)
            }

@router.get("/by-hour")
async def get_sales_by_hour(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None)
):
    """
    Get sales distribution by hour of day (0-23)
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_sales_by_hour_query(filters)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "peak_hour": max(results, key=lambda x: x["sales_count"])["hour"] if results else None
            }

@router.get("/by-weekday")
async def get_sales_by_weekday(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None)
):
    """
    Get sales distribution by day of week
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_sales_by_weekday_query(filters)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "best_day": max(results, key=lambda x: x["sales_count"])["weekday"] if results else None
            }

@router.get("/by-channel")
async def get_sales_by_channel(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None)
):
    """
    Get sales distribution by channel
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            query, params = get_sales_by_channel_query(filters)
            cur.execute(query, params)
            results = serialize_rows(cur.fetchall())
            
            return {
                "data": results,
                "top_channel": max(results, key=lambda x: x["revenue"])["channel_name"] if results else None
            }