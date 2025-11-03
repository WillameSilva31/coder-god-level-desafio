"""
Overview routes - Dashboard main metrics
"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta

from cache import cache_response
from database import get_db, serialize_row
from queries import get_overview_query, get_customization_stats_query

router = APIRouter(prefix="/api/overview", tags=["Overview"])

@router.get("")
@cache_response(ttl=300)
async def get_overview(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    store_id: Optional[int] = Query(None, description="Store ID filter"),
    channel_id: Optional[int] = Query(None, description="Channel ID filter"),
    hour_start: Optional[int] = Query(None, description="Start hour (0-23)"),
    hour_end: Optional[int] = Query(None, description="End hour (0-23)")
):
    """
    Get dashboard overview metrics
    """
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id,
        "hour_start": hour_start,
        "hour_end": hour_end
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            # Get main metrics
            query, params = get_overview_query(filters)
            cur.execute(query, params)
            overview = serialize_row(cur.fetchone())
            
            # Get customization stats
            custom_query, custom_params = get_customization_stats_query(filters)
            cur.execute(custom_query, custom_params)
            custom_stats = serialize_row(cur.fetchone())
            
            # Merge results
            result = {
                **overview,
                "customization_rate": custom_stats.get("customization_rate", 0),
                "total_items_added": custom_stats.get("total_items_added", 0)
            }
            
            return result

@router.get("/comparison")
async def get_comparison(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None)
):
    """
    Compare current period with previous period
    """
    # Parse dates
    if not start_date or not end_date:
        end = datetime.now()
        start = end - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
        end_date = end.strftime("%Y-%m-%d")
    else:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Calculate previous period
    period_length = (end - start).days
    prev_start = start - timedelta(days=period_length)
    prev_end = start - timedelta(days=1)
    
    filters_current = {
        "start_date": start_date,
        "end_date": end_date,
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    filters_previous = {
        "start_date": prev_start.strftime("%Y-%m-%d"),
        "end_date": prev_end.strftime("%Y-%m-%d"),
        "store_id": store_id,
        "channel_id": channel_id
    }
    
    with get_db() as conn:
        with conn.cursor() as cur:
            # Current period
            query_current, params_current = get_overview_query(filters_current)
            cur.execute(query_current, params_current)
            current = serialize_row(cur.fetchone())
            
            # Previous period
            query_prev, params_prev = get_overview_query(filters_previous)
            cur.execute(query_prev, params_prev)
            previous = serialize_row(cur.fetchone())
            
            # Calculate changes
            def calc_change(current_val, prev_val):
                if prev_val == 0:
                    return 0
                return round(((current_val - prev_val) / prev_val) * 100, 2)
            
            return {
                "current": current,
                "previous": previous,
                "changes": {
                    "total_sales": calc_change(
                        current.get("total_sales", 0),
                        previous.get("total_sales", 0)
                    ),
                    "total_revenue": calc_change(
                        current.get("total_revenue", 0),
                        previous.get("total_revenue", 0)
                    ),
                    "avg_ticket": calc_change(
                        current.get("avg_ticket", 0),
                        previous.get("avg_ticket", 0)
                    )
                }
            }