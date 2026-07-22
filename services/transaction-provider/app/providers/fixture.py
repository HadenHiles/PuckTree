"""Fixture-based transaction provider for testing and development."""

import json
from datetime import date
from pathlib import Path

from app.config import settings
from app.models.raw import RawProviderTransaction


class FixtureTransactionProvider:
    """
    Provider that returns pre-captured fixture data.
    
    Used for:
    - Local development without external services
    - Automated tests
    - Public demonstrations
    """

    def __init__(self) -> None:
        self.fixture_path = Path(settings.fixture_data_path)
        self.fixtures_loaded = False
        self._fixtures: dict[str, list[dict]] = {}

    def _load_fixtures(self) -> None:
        """Load fixture data from JSON files."""
        if self.fixtures_loaded:
            return

        sample_file = self.fixture_path / "nhl" / "sample_players.json"
        if sample_file.exists():
            with open(sample_file, "r") as f:
                data = json.load(f)
                self._fixtures = data
                self.fixtures_loaded = True
        else:
            # No fixtures available yet
            self._fixtures = {}
            self.fixtures_loaded = True

    async def search_player_transactions(
        self,
        player_name: str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[RawProviderTransaction]:
        """Return fixture data for known players."""
        self._load_fixtures()

        # Normalize player name for lookup (replace spaces with underscores)
        normalized_name = player_name.strip().lower().replace(" ", "_")

        # Find matching fixture
        player_fixtures = None
        for fixture_name, fixture_data in self._fixtures.items():
            if normalized_name in fixture_name.lower():
                player_fixtures = fixture_data
                break

        if not player_fixtures:
            # No fixtures for this player
            return []

        # Convert fixture data to RawProviderTransaction models
        transactions: list[RawProviderTransaction] = []
        for row in player_fixtures:
            transaction_date_str = row.get("Date", "")
            try:
                transaction_date = date.fromisoformat(transaction_date_str)
            except ValueError:
                continue

            # Apply date filters if provided
            if start_date and transaction_date < start_date:
                continue
            if end_date and transaction_date > end_date:
                continue

            team_text = row.get("Team")
            acquired_text = row.get("Acquired")
            relinquished_text = row.get("Relinquished")
            notes = row.get("Notes", "")

            fingerprint = RawProviderTransaction.generate_fingerprint(
                transaction_date, team_text, acquired_text, relinquished_text
            )

            transaction = RawProviderTransaction(
                provider="fixture",
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

    async def health_check(self) -> dict[str, str | bool]:
        """Check fixture provider health."""
        self._load_fixtures()

        player_count = len(self._fixtures)
        if player_count > 0:
            return {
                "status": "healthy",
                "message": f"Fixture provider ready with {player_count} player(s)",
            }

        return {
            "status": "degraded",
            "message": "Fixture provider active but no fixtures loaded",
        }
