"""
Database connection and utilities
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os
from decimal import Decimal

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "godlevel-db"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "challenge_db"),
    "user": os.getenv("DB_USER", "challenge"),
    "password": os.getenv("DB_PASSWORD", "challenge_2024")
}

def get_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

def serialize_decimal(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

def serialize_row(row):
    """Serialize a database row (dict) to JSON-compatible format"""
    if row is None:
        return None
    return {k: serialize_decimal(v) for k, v in row.items()}

def serialize_rows(rows):
    """Serialize multiple database rows"""
    return [serialize_row(row) for row in rows]

def test_connection():
    """Test database connection"""
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) as count FROM sales")
                result = cur.fetchone()
                print(f"✅ Database connected! Found {result['count']:,} sales")
                return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()