"""Disabled transaction provider."""

from datetime import date

from app.models.raw import RawProviderTransaction


class DisabledTransactionProvider:
    """
    Provider that returns no data.
    
    Used when automatic transaction discovery should be completely disabled,
    forcing manual entry for all trade data.
    """

    async def search_player_transactions(
        self,
        player_name: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[RawProviderTransaction]:
        """Always return empty list."""
        return []

    async def health_check(self) -> dict[str, str | bool]:
        """Report disabled status."""
        return {
            "status": "healthy",
            "message": "Transaction provider is disabled",
        }
