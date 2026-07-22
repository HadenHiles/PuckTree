"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, internal

# Create FastAPI application
app = FastAPI(
    title="PuckTree Transaction Provider",
    description="Transaction discovery and normalization service for PuckTree",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
    if settings.debug
    else [],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(internal.router, tags=["internal"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "pucktree-transaction-provider",
        "version": "0.1.0",
        "docs": "/docs" if settings.debug else None,
    }
