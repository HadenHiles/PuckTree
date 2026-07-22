"""Health check endpoint."""

from fastapi import APIRouter

from app.config import ProviderType, settings
from app.providers.disabled import DisabledTransactionProvider
from app.providers.fixture import FixtureTransactionProvider
from app.providers.pro_sports import ProSportsTransactionsProvider

router = APIRouter()


def get_provider():
    """Get the configured transaction provider."""
    if settings.transaction_provider == ProviderType.PRO_SPORTS:
        return ProSportsTransactionsProvider()
    elif settings.transaction_provider == ProviderType.FIXTURE:
        return FixtureTransactionProvider()
    else:
        return DisabledTransactionProvider()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns service status and provider availability.
    """
    provider = get_provider()
    provider_health = await provider.health_check()

    return {
        "service": "pucktree-transaction-provider",
        "status": "healthy",
        "version": "0.1.0",
        "provider": {
            "type": settings.transaction_provider.value,
            "status": provider_health.get("status"),
            "message": provider_health.get("message"),
        },
    }
