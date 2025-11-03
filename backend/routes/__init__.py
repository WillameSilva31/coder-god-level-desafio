"""
Routes initialization
"""
from fastapi import APIRouter
from .overview import router as overview_router
from .sales import router as sales_router
from .products import router as products_router

# Combine all routers
api_router = APIRouter()
api_router.include_router(overview_router)
api_router.include_router(sales_router)
api_router.include_router(products_router)