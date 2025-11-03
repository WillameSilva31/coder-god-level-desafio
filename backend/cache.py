from functools import wraps
import time
import hashlib
import json

# In-memory cache
_cache = {}
_cache_timestamps = {}

# Cache TTL (Time To Live) in seconds
CACHE_TTL = 300  # 5 minutes

def get_cache_key(func_name, *args, **kwargs):
    """Generate cache key from function name and arguments"""
    key_data = {
        'func': func_name,
        'args': args,
        'kwargs': {k: v for k, v in kwargs.items() if v is not None}
    }
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_str.encode()).hexdigest()

def cache_response(ttl=CACHE_TTL):
    """Decorator to cache API responses"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = get_cache_key(func.__name__, *args, **kwargs)
            
            # Check if cached and not expired
            if cache_key in _cache:
                cached_time = _cache_timestamps.get(cache_key, 0)
                if time.time() - cached_time < ttl:
                    print(f"✅ Cache HIT: {func.__name__}")
                    return _cache[cache_key]
            
            # Not cached or expired, execute function
            print(f"⚠️ Cache MISS: {func.__name__}")
            result = await func(*args, **kwargs)
            
            # Store in cache
            _cache[cache_key] = result
            _cache_timestamps[cache_key] = time.time()
            
            return result
        return wrapper
    return decorator

def clear_cache():
    """Clear all cache"""
    _cache.clear()
    _cache_timestamps.clear()
    print("🗑️ Cache cleared")