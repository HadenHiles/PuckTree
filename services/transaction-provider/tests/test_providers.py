"""Tests for transaction provider implementations."""

import pytest
from datetime import date

from app.models.raw import RawProviderTransaction
from app.providers.fixture import FixtureTransactionProvider
from app.providers.disabled import DisabledTransactionProvider


class TestFixtureProvider:
    """Tests for fixture-based transaction provider."""

    @pytest.mark.asyncio
    async def test_fixture_provider_no_data(self):
        """Test fixture provider with no loaded fixtures."""
        provider = FixtureTransactionProvider()
        results = await provider.search_player_transactions("Unknown Player")
        assert results == []

    @pytest.mark.asyncio
    async def test_fixture_provider_health_check(self):
        """Test fixture provider health check."""
        provider = FixtureTransactionProvider()
        health = await provider.health_check()
        
        assert "status" in health
        assert "message" in health
        assert health["status"] in ["healthy", "degraded"]


class TestDisabledProvider:
    """Tests for disabled transaction provider."""

    @pytest.mark.asyncio
    async def test_disabled_provider_returns_empty(self):
        """Test disabled provider always returns empty list."""
        provider = DisabledTransactionProvider()
        results = await provider.search_player_transactions("Any Player")
        assert results == []

    @pytest.mark.asyncio
    async def test_disabled_provider_with_date_range(self):
        """Test disabled provider with date range still returns empty."""
        provider = DisabledTransactionProvider()
        results = await provider.search_player_transactions(
            "Any Player",
            start_date=date(2020, 1, 1),
            end_date=date(2023, 12, 31),
        )
        assert results == []

    @pytest.mark.asyncio
    async def test_disabled_provider_health_check(self):
        """Test disabled provider health check."""
        provider = DisabledTransactionProvider()
        health = await provider.health_check()
        
        assert health["status"] == "healthy"
        assert "disabled" in health["message"].lower()


class TestRawProviderTransaction:
    """Tests for raw provider transaction model."""

    def test_fingerprint_generation(self):
        """Test deterministic fingerprint generation."""
        fingerprint1 = RawProviderTransaction.generate_fingerprint(
            transaction_date=date(2023, 6, 28),
            team_text="Maple Leafs",
            acquired_text="• Auston Matthews",
            relinquished_text="• 2023 1st round pick",
        )
        
        fingerprint2 = RawProviderTransaction.generate_fingerprint(
            transaction_date=date(2023, 6, 28),
            team_text="Maple Leafs",
            acquired_text="• Auston Matthews",
            relinquished_text="• 2023 1st round pick",
        )
        
        assert fingerprint1 == fingerprint2
        assert len(fingerprint1) == 16

    def test_fingerprint_different_for_different_data(self):
        """Test fingerprints differ for different transactions."""
        fingerprint1 = RawProviderTransaction.generate_fingerprint(
            transaction_date=date(2023, 6, 28),
            team_text="Maple Leafs",
            acquired_text="• Auston Matthews",
            relinquished_text="",
        )
        
        fingerprint2 = RawProviderTransaction.generate_fingerprint(
            transaction_date=date(2023, 6, 28),
            team_text="Maple Leafs",
            acquired_text="• Connor McDavid",
            relinquished_text="",
        )
        
        assert fingerprint1 != fingerprint2
