"""Raw provider transaction models."""

import hashlib
from dataclasses import dataclass
from datetime import date


@dataclass
class RawProviderTransaction:
    """
    Raw transaction record captured from a provider.
    
    This represents the minimally processed output from pro_sports_transactions
    or another data source. Fields are preserved as-is for fingerprinting and
    debugging, with normalization happening in a separate step.
    """

    # Provider metadata
    provider: str
    source_url: str | None

    # Core transaction fields
    transaction_date: date
    team_text: str | None
    acquired_text: str | None
    relinquished_text: str | None
    description_text: str

    # Deterministic fingerprint for deduplication
    raw_fingerprint: str

    @staticmethod
    def generate_fingerprint(
        transaction_date: date,
        team_text: str | None,
        acquired_text: str | None,
        relinquished_text: str | None,
    ) -> str:
        """
        Generate a deterministic fingerprint for deduplication.
        
        Combines normalized date and sorted text tokens to detect duplicate
        records from the same provider.
        """
        parts = [
            transaction_date.isoformat(),
            (team_text or "").strip().lower(),
            (acquired_text or "").strip().lower(),
            (relinquished_text or "").strip().lower(),
        ]
        content = "|".join(parts)
        return hashlib.sha256(content.encode()).hexdigest()[:16]
