"""Internal transaction search endpoints."""

from datetime import date, datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.config import ProviderType, settings
from app.models.normalized import TransactionSearchResponse
from app.normalizer import TransactionNormalizer
from app.providers.disabled import DisabledTransactionProvider
from app.providers.fixture import FixtureTransactionProvider
from app.providers.pro_sports import ProSportsTransactionsProvider, ProviderError

router = APIRouter(prefix="/internal")


def get_provider():
    """Get the configured transaction provider."""
    if settings.transaction_provider == ProviderType.PRO_SPORTS:
        return ProSportsTransactionsProvider()
    elif settings.transaction_provider == ProviderType.FIXTURE:
        return FixtureTransactionProvider()
    else:
        return DisabledTransactionProvider()


@router.get("/transactions/search")
async def search_transactions(
    player_name: str = Query(..., description="Full or partial player name"),
    start_date: str | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="End date (YYYY-MM-DD)"),
) -> TransactionSearchResponse:
    """
    Search for player transactions.
    
    This is an internal endpoint called by the Next.js server layer.
    Do not expose directly to the browser.
    """
    # Parse date parameters
    start = None
    end = None
    try:
        if start_date:
            start = date.fromisoformat(start_date)
        if end_date:
            end = date.fromisoformat(end_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")

    # Get provider and search
    provider = get_provider()
    provider_status = "success"
    provider_message = None
    is_partial = False

    try:
        raw_transactions = await provider.search_player_transactions(
            player_name=player_name,
            start_date=start,
            end_date=end,
        )

        # Normalize transactions
        normalizer = TransactionNormalizer()
        normalized_transactions = normalizer.normalize_transactions(raw_transactions)

    except TimeoutError as e:
        provider_status = "failed"
        provider_message = str(e)
        normalized_transactions = []
    except ProviderError as e:
        provider_status = "failed"
        provider_message = str(e)
        normalized_transactions = []
    except Exception as e:
        # Log unexpected errors but don't expose internals
        print(f"Unexpected error during transaction search: {e}")
        provider_status = "failed"
        provider_message = "An unexpected error occurred"
        normalized_transactions = []

    # Check if provider is disabled
    if settings.transaction_provider == ProviderType.DISABLED:
        provider_status = "disabled"
        provider_message = "Transaction provider is disabled"

    return TransactionSearchResponse(
        query=player_name,
        transactions=normalized_transactions,
        is_partial=is_partial,
        provider_status=provider_status,
        provider_message=provider_message,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
    )
