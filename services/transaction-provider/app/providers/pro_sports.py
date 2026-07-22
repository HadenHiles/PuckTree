"""Pro Sports Transactions provider implementation."""

import asyncio
from datetime import date
from typing import Any

from app.config import settings
from app.models.raw import RawProviderTransaction

try:
    import pro_sports_transactions as pst
    from pro_sports_transactions.handlers import UnflareConfig, UnflareRequestHandler

    PST_AVAILABLE = True
except ImportError:
    PST_AVAILABLE = False


class ProviderError(Exception):
    """Base exception for provider errors."""

    pass


class ProSportsTransactionsProvider:
    """
    Transaction provider using the pro_sports_transactions package.
    
    Requires Unflare service for reliable access due to Cloudflare protection.
    """

    def __init__(self) -> None:
        if not PST_AVAILABLE:
            raise ProviderError("pro_sports_transactions package is not installed")

        if not settings.unflare_service_url:
            raise ProviderError(
                "UNFLARE_SERVICE_URL must be configured for pro_sports provider"
            )

        # Configure Unflare handler
        self.unflare_config = UnflareConfig(
            url=settings.unflare_service_url,
            timeout=settings.unflare_timeout_ms,
        )
        self.request_handler = UnflareRequestHandler(self.unflare_config)

    async def search_player_transactions(
        self,
        player_name: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[RawProviderTransaction]:
        """Search for player transactions using pro_sports_transactions."""
        try:
            # Create search with Movement transaction type (trades, waivers, etc.)
            search = pst.Search(
                league=pst.League.NHL,
                transaction_types=(pst.TransactionType.Movement,),
                player=player_name,
                start_date=start_date,
                end_date=end_date,
                request_handler=self.request_handler,
            )

            # Execute search with timeout
            result_dict = await asyncio.wait_for(
                search.get_dict(),
                timeout=settings.provider_timeout_seconds,
            )

            # Convert to RawProviderTransaction models
            transactions: list[RawProviderTransaction] = []
            for row in result_dict:
                transaction_date_str = row.get("Date", "")
                try:
                    transaction_date = date.fromisoformat(transaction_date_str)
                except ValueError:
                    # Skip rows with invalid dates
                    continue

                team_text = row.get("Team")
                acquired_text = row.get("Acquired")
                relinquished_text = row.get("Relinquished")
                notes = row.get("Notes", "")

                fingerprint = RawProviderTransaction.generate_fingerprint(
                    transaction_date, team_text, acquired_text, relinquished_text
                )

                transaction = RawProviderTransaction(
                    provider="pro_sports_transactions",
                    source_url="https://www.prosportstransactions.com/",
                    transaction_date=transaction_date,
                    team_text=team_text,
                    acquired_text=acquired_text,
                    relinquished_text=relinquished_text,
                    description_text=notes,
                    raw_fingerprint=fingerprint,
                )
                transactions.append(transaction)

            return transactions

        except asyncio.TimeoutError:
            raise TimeoutError(
                f"Provider request timed out after {settings.provider_timeout_seconds}s"
            )
        except Exception as e:
            raise ProviderError(f"Pro Sports Transactions lookup failed: {str(e)}")

    async def health_check(self) -> dict[str, str | bool]:
        """Check Pro Sports Transactions provider health."""
        if not PST_AVAILABLE:
            return {
                "status": "unhealthy",
                "message": "pro_sports_transactions package not installed",
            }

        if not settings.unflare_service_url:
            return {
                "status": "unhealthy",
                "message": "Unflare service URL not configured",
            }

        # Check if Unflare handler has cached cookies (indicates recent successful request)
        has_cache = self.request_handler.has_cached_cookies
        cache_valid = self.request_handler.is_cache_valid()

        if has_cache and cache_valid:
            return {
                "status": "healthy",
                "message": "Pro Sports Transactions provider ready with valid cache",
            }

        return {
            "status": "degraded",
            "message": "Pro Sports Transactions provider configured but cache is cold",
        }
