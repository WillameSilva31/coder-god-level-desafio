"""
Optimized SQL queries for the restaurant analytics API
"""

def get_overview_query(filters):
    """
    Get overview metrics (total sales, revenue, avg ticket, etc.)
    """
    where_clause, params = build_where_clause(filters, table_prefix='s')
    
    query = f"""
        SELECT 
            COUNT(*) as total_sales,
            COUNT(DISTINCT s.store_id) as total_stores,
            COUNT(DISTINCT s.customer_id) as unique_customers,
            SUM(s.total_amount)::NUMERIC(20,2) as total_revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket,
            SUM(s.total_discount)::NUMERIC(20,2) as total_discounts,
            AVG(s.production_seconds / 60.0)::NUMERIC(20,2) as avg_production_time_min,
            AVG(s.delivery_seconds / 60.0)::NUMERIC(20,2) as avg_delivery_time_min
        FROM sales s
        WHERE {where_clause}
    """
    
    return query, params

def get_sales_by_date_query(filters, group_by="day"):
    """
    Get sales aggregated by time period
    """
    where_clause, params = build_where_clause(filters, table_prefix='s')
    
    # Date grouping
    date_trunc_map = {
        "day": "DATE(s.created_at)",
        "week": "DATE_TRUNC('week', s.created_at)::date",
        "month": "DATE_TRUNC('month', s.created_at)::date"
    }
    date_group = date_trunc_map.get(group_by, "DATE(s.created_at)")
    
    query = f"""
        SELECT 
            {date_group} as date,
            COUNT(*) as sales_count,
            SUM(s.total_amount)::NUMERIC(20,2) as revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket
        FROM sales s
        WHERE {where_clause}
        GROUP BY {date_group}
        ORDER BY date
    """
    
    return query, params

def get_sales_by_hour_query(filters):
    """
    Get sales distribution by hour of day
    """
    where_clause, params = build_where_clause(filters, table_prefix='s')
    
    query = f"""
        SELECT 
            EXTRACT(HOUR FROM s.created_at)::INTEGER as hour,
            COUNT(*) as sales_count,
            SUM(s.total_amount)::NUMERIC(20,2) as revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM sales s
        WHERE {where_clause}
        GROUP BY hour
        ORDER BY hour
    """
    
    return query, params

def get_sales_by_weekday_query(filters):
    """
    Get sales distribution by day of week
    """
    where_clause, params = build_where_clause(filters, table_prefix='s')
    
    query = f"""
        SELECT 
            CASE EXTRACT(DOW FROM s.created_at)::INTEGER
                WHEN 0 THEN 'Domingo'
                WHEN 1 THEN 'Segunda'
                WHEN 2 THEN 'Terça'
                WHEN 3 THEN 'Quarta'
                WHEN 4 THEN 'Quinta'
                WHEN 5 THEN 'Sexta'
                WHEN 6 THEN 'Sábado'
            END as weekday,
            EXTRACT(DOW FROM s.created_at)::INTEGER as weekday_num,
            COUNT(*) as sales_count,
            SUM(s.total_amount)::NUMERIC(20,2) as revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM sales s
        WHERE {where_clause}
        GROUP BY weekday, weekday_num
        ORDER BY weekday_num
    """
    
    return query, params

def get_sales_by_channel_query(filters):
    """
    Get sales distribution by channel
    """
    # Use custom where clause for JOIN queries
    conditions = ["s.sale_status_desc = 'COMPLETED'"]
    params = []
    
    if filters.get("start_date"):
        conditions.append("s.created_at >= %s")
        params.append(filters["start_date"])
    
    if filters.get("end_date"):
        conditions.append("s.created_at <= %s")
        params.append(filters["end_date"])
    
    if filters.get("store_id"):
        conditions.append("s.store_id = %s")
        params.append(filters["store_id"])
    
    # Note: No channel_id filter since we're grouping by channel
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            c.id,
            c.name as channel_name,
            c.type as channel_type,
            COUNT(s.id) as sales_count,
            SUM(s.total_amount)::NUMERIC(20,2) as revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as sales_percentage,
            ROUND(SUM(s.total_amount) * 100.0 / SUM(SUM(s.total_amount)) OVER(), 2) as revenue_percentage
        FROM sales s
        JOIN channels c ON c.id = s.channel_id
        WHERE {where_clause}
        GROUP BY c.id, c.name, c.type
        ORDER BY revenue DESC
    """
    
    return query, params

def get_top_products_query(filters, limit=10):
    """
    Get top selling products
    """
    # Custom where clause for multi-table JOIN
    conditions = ["s.sale_status_desc = 'COMPLETED'"]
    params = []
    
    if filters.get("start_date"):
        conditions.append("s.created_at >= %s")
        params.append(filters["start_date"])
    
    if filters.get("end_date"):
        conditions.append("s.created_at <= %s")
        params.append(filters["end_date"])
    
    if filters.get("store_id"):
        conditions.append("s.store_id = %s")
        params.append(filters["store_id"])
    
    if filters.get("channel_id"):
        conditions.append("s.channel_id = %s")
        params.append(filters["channel_id"])
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            p.id,
            p.name as product_name,
            c.name as category_name,
            COUNT(ps.id) as times_sold,
            SUM(ps.quantity)::NUMERIC(20,2) as total_quantity,
            SUM(ps.total_price)::NUMERIC(20,2) as total_revenue,
            AVG(ps.base_price)::NUMERIC(20,2) as avg_price
        FROM product_sales ps
        JOIN products p ON p.id = ps.product_id
        JOIN categories c ON c.id = p.category_id
        JOIN sales s ON s.id = ps.sale_id
        WHERE {where_clause}
        GROUP BY p.id, p.name, c.name
        ORDER BY times_sold DESC
        LIMIT %s
    """
    
    params.append(limit)
    return query, params

def get_top_items_query(filters, limit=15):
    """
    Get top customizations/items added
    """
    # Custom where clause for multi-table JOIN
    conditions = ["s.sale_status_desc = 'COMPLETED'"]
    params = []
    
    if filters.get("start_date"):
        conditions.append("s.created_at >= %s")
        params.append(filters["start_date"])
    
    if filters.get("end_date"):
        conditions.append("s.created_at <= %s")
        params.append(filters["end_date"])
    
    if filters.get("store_id"):
        conditions.append("s.store_id = %s")
        params.append(filters["store_id"])
    
    if filters.get("channel_id"):
        conditions.append("s.channel_id = %s")
        params.append(filters["channel_id"])
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            i.id,
            i.name as item_name,
            c.name as category_name,
            COUNT(ips.id) as times_added,
            SUM(ips.additional_price)::NUMERIC(20,2) as revenue_generated,
            AVG(ips.additional_price)::NUMERIC(20,2) as avg_price
        FROM item_product_sales ips
        JOIN items i ON i.id = ips.item_id
        JOIN categories c ON c.id = i.category_id
        JOIN product_sales ps ON ps.id = ips.product_sale_id
        JOIN sales s ON s.id = ps.sale_id
        WHERE {where_clause}
        GROUP BY i.id, i.name, c.name
        ORDER BY times_added DESC
        LIMIT %s
    """
    
    params.append(limit)
    return query, params

def get_stores_performance_query(filters, limit=20):
    """
    Get stores performance ranking
    """
    # Custom where clause for JOIN
    conditions = ["s.sale_status_desc = 'COMPLETED'"]
    params = []
    
    if filters.get("start_date"):
        conditions.append("s.created_at >= %s")
        params.append(filters["start_date"])
    
    if filters.get("end_date"):
        conditions.append("s.created_at <= %s")
        params.append(filters["end_date"])
    
    # No store_id filter since we're comparing stores
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            st.id,
            st.name as store_name,
            st.city,
            st.state,
            COUNT(s.id) as sales_count,
            SUM(s.total_amount)::NUMERIC(20,2) as revenue,
            AVG(s.total_amount)::NUMERIC(20,2) as avg_ticket,
            SUM(s.total_discount)::NUMERIC(20,2) as total_discounts,
            AVG(s.production_seconds / 60.0)::NUMERIC(20,2) as avg_production_time_min
        FROM stores st
        JOIN sales s ON s.store_id = st.id
        WHERE {where_clause}
        GROUP BY st.id, st.name, st.city, st.state
        ORDER BY revenue DESC
        LIMIT %s
    """
    
    params.append(limit)
    return query, params

def get_customization_stats_query(filters):
    """
    Get customization statistics
    """
    where_clause, params = build_where_clause(filters, table_prefix='s')
    
    query = f"""
        WITH customized_sales AS (
            SELECT DISTINCT ps.sale_id
            FROM item_product_sales ips
            JOIN product_sales ps ON ps.id = ips.product_sale_id
        )
        SELECT 
            COUNT(DISTINCT s.id) as total_sales,
            COUNT(DISTINCT cs.sale_id) as customized_sales,
            ROUND(
                COUNT(DISTINCT cs.sale_id) * 100.0 / 
                NULLIF(COUNT(DISTINCT s.id), 0), 
                2
            ) as customization_rate,
            (
                SELECT COUNT(*) 
                FROM item_product_sales ips
                JOIN product_sales ps ON ps.id = ips.product_sale_id
                JOIN sales s2 ON s2.id = ps.sale_id
                WHERE s2.sale_status_desc = 'COMPLETED'
            ) as total_items_added
        FROM sales s
        LEFT JOIN customized_sales cs ON cs.sale_id = s.id
        WHERE {where_clause}
    """
    
    return query, params

def build_where_clause(filters, table_prefix=''):
    """
    Build WHERE clause and parameters from filters
    
    Args:
        filters: Dictionary with filter values
        table_prefix: Table alias to use (e.g., 's' for sales)
    """
    prefix = f"{table_prefix}." if table_prefix else ""
    
    conditions = [f"{prefix}sale_status_desc = 'COMPLETED'"]
    params = []
    
    if filters.get("start_date"):
        conditions.append(f"{prefix}created_at >= %s")
        params.append(filters["start_date"])
    
    if filters.get("end_date"):
        conditions.append(f"{prefix}created_at <= %s")
        params.append(filters["end_date"])
    
    if filters.get("store_id"):
        conditions.append(f"{prefix}store_id = %s")
        params.append(filters["store_id"])
    
    if filters.get("channel_id"):
        conditions.append(f"{prefix}channel_id = %s")
        params.append(filters["channel_id"])
    
    # Filtro de hora
    if filters.get("hour_start") is not None and filters.get("hour_end") is not None:
        hour_start = int(filters["hour_start"])
        hour_end = int(filters["hour_end"])
        
        # Se hour_end < hour_start, significa que cruza meia-noite (ex: 23h às 5h)
        if hour_end < hour_start:
            conditions.append(f"(EXTRACT(HOUR FROM {prefix}created_at)::INTEGER >= %s OR EXTRACT(HOUR FROM {prefix}created_at)::INTEGER <= %s)")
            params.extend([hour_start, hour_end])
        else:
            conditions.append(f"EXTRACT(HOUR FROM {prefix}created_at)::INTEGER BETWEEN %s AND %s")
            params.extend([hour_start, hour_end])
    
    where_clause = " AND ".join(conditions)
    return where_clause, params

# Queries for filters/dropdowns
GET_STORES_QUERY = """
    SELECT id, name, city, state
    FROM stores
    WHERE is_active = true
    ORDER BY name
"""

GET_CHANNELS_QUERY = """
    SELECT DISTINCT ON (name) id, name, type
    FROM channels
    ORDER BY name, id
"""