"""Transaction provider protocol."""

from datetime import date
from typing import Protocol

from app.models.raw import RawProviderTransaction


class TransactionProvider(Protocol):
    """
    Protocol defining the interface for transaction data providers.
    
    Implementations must return raw provider transactions that will be
    normalized by the normalization layer. Providers should not normalize
    data themselves.
    """

    async def search_player_transactions(
        self,
        player_name: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[RawProviderTransaction]:
        """
        Search for transactions involving a specific player.
        
        Args:
            player_name: Full or partial player name
            start_date: Optional earliest transaction date
            end_date: Optional latest transaction date
            
        Returns:
            List of raw provider transactions. May be empty if no records found.
            
        Raises:
            TimeoutError: If provider request exceeds configured timeout
            ProviderError: For other provider-specific failures
        """
        ...

    async def health_check(self) -> dict[str, str | bool]:
        """
        Check provider health and availability.
        
        Returns:
            Dictionary with status information. Must include:
            - "status": "healthy" | "degraded" | "unhealthy"
            - "message": Human-readable status description
        """
        ...
