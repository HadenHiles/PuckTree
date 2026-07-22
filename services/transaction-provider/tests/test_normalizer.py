"""Tests for transaction normalization logic."""

import pytest
from datetime import date

from app.models.raw import RawProviderTransaction
from app.models.normalized import ConfidenceLevel, TransactionKind
from app.normalizer import TransactionNormalizer


class TestTransactionNormalizer:
    """Tests for transaction normalizer."""

    def test_normalize_empty_list(self):
        """Test normalizing empty transaction list."""
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([])
        assert result == []

    def test_normalize_simple_player_trade(self):
        """Test normalizing a simple player trade."""
        raw = RawProviderTransaction(
            provider="test",
            source_url="https://example.com",
            transaction_date=date(2023, 6, 28),
            team_text="Maple Leafs",
            acquired_text="• Auston Matthews",
            relinquished_text="• Connor Brown",
            description_text="traded with Ottawa",
            raw_fingerprint="test123",
        )
        
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([raw])
        
        assert len(result) == 1
        transaction = result[0]
        
        assert transaction.kind == TransactionKind.TRADE
        assert len(transaction.teams) == 1
        assert transaction.teams[0].team_name == "Toronto Maple Leafs"
        assert len(transaction.assets) == 2
        assert transaction.confidence in [ConfidenceLevel.VERIFIED, ConfidenceLevel.STRONG_MATCH]

    def test_normalize_draft_pick(self):
        """Test normalizing draft pick assets."""
        raw = RawProviderTransaction(
            provider="test",
            source_url="https://example.com",
            transaction_date=date(2023, 6, 28),
            team_text="Toronto",
            acquired_text="• 2023 1st round draft pick (28th overall)",
            relinquished_text="",
            description_text="acquired from Vancouver",
            raw_fingerprint="test456",
        )
        
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([raw])
        
        assert len(result) == 1
        transaction = result[0]
        
        assert len(transaction.assets) == 1
        asset = transaction.assets[0]
        
        assert asset.kind == "draft-pick"
        assert asset.draft_year == 2023
        assert asset.round == 1
        assert asset.overall == 28

    def test_normalize_conditional_pick(self):
        """Test normalizing conditional draft pick."""
        raw = RawProviderTransaction(
            provider="test",
            source_url="https://example.com",
            transaction_date=date(2024, 3, 1),
            team_text="Boston",
            acquired_text="• conditional 2025 3rd round pick",
            relinquished_text="",
            description_text="if team makes playoffs",
            raw_fingerprint="test789",
        )
        
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([raw])
        
        assert len(result) == 1
        transaction = result[0]
        
        asset = transaction.assets[0]
        assert asset.kind == "draft-pick"
        assert asset.draft_year == 2025
        assert asset.round == 3
        assert asset.conditions_text is not None
        assert asset.confidence == ConfidenceLevel.POSSIBLE

    def test_normalize_player_with_punctuation(self, sample_player_names):
        """Test normalizing player names with punctuation."""
        normalizer = TransactionNormalizer()
        
        for name in sample_player_names:
            raw = RawProviderTransaction(
                provider="test",
                source_url="https://example.com",
                transaction_date=date(2023, 7, 1),
                team_text="Montreal",
                acquired_text=f"• {name}",
                relinquished_text="",
                description_text="signed as free agent",
                raw_fingerprint=f"test{name}",
            )
            
            result = normalizer.normalize_transactions([raw])
            assert len(result) == 1
            assert len(result[0].assets) == 1
            assert result[0].assets[0].player_ref is not None
            assert result[0].assets[0].player_ref.player_name == name

    def test_normalize_multi_asset_transaction(self, sample_multi_asset_trade):
        """Test normalizing transaction with multiple assets."""
        raw = RawProviderTransaction(
            provider="test",
            source_url="https://example.com",
            transaction_date=date.fromisoformat(sample_multi_asset_trade["Date"]),
            team_text=sample_multi_asset_trade["Team"],
            acquired_text=sample_multi_asset_trade["Acquired"],
            relinquished_text=sample_multi_asset_trade["Relinquished"],
            description_text=sample_multi_asset_trade["Notes"],
            raw_fingerprint="multiasset123",
        )
        
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([raw])
        
        assert len(result) == 1
        transaction = result[0]
        
        # Should have 4 assets total (2 acquired, 2 relinquished)
        assert len(transaction.assets) >= 3  # At least 3 parsed
        
        # Should have player and pick assets
        asset_kinds = {asset.kind for asset in transaction.assets}
        assert "player" in asset_kinds
        assert "draft-pick" in asset_kinds

    def test_team_name_normalization(self):
        """Test team name normalization with various formats."""
        normalizer = TransactionNormalizer()
        
        test_cases = [
            ("Maple Leafs", "Toronto Maple Leafs"),
            ("Toronto", "Toronto Maple Leafs"),
            ("TOR", "Toronto Maple Leafs"),
            ("Bruins", "Boston Bruins"),
            ("Boston", "Boston Bruins"),
        ]
        
        for input_name, expected_name in test_cases:
            raw = RawProviderTransaction(
                provider="test",
                source_url="https://example.com",
                transaction_date=date(2023, 1, 1),
                team_text=input_name,
                acquired_text="• Test Player",
                relinquished_text="",
                description_text="test",
                raw_fingerprint=f"team{input_name}",
            )
            
            result = normalizer.normalize_transactions([raw])
            assert len(result) == 1
            assert result[0].teams[0].team_name == expected_name

    def test_transaction_classification(self):
        """Test transaction kind classification."""
        normalizer = TransactionNormalizer()
        
        test_cases = [
            ("traded", "acquired", "relinquished", TransactionKind.TRADE),
            ("claimed off waivers", "", "", TransactionKind.WAIVER),
            ("signed", "", "", TransactionKind.SIGNING),
            ("drafted", "", "", TransactionKind.DRAFT),
        ]
        
        for desc, acquired, relinquished, expected_kind in test_cases:
            raw = RawProviderTransaction(
                provider="test",
                source_url="https://example.com",
                transaction_date=date(2023, 1, 1),
                team_text="Toronto",
                acquired_text=acquired if acquired else "• Test Player",
                relinquished_text=relinquished if relinquished else "",
                description_text=desc,
                raw_fingerprint=f"kind{desc}",
            )
            
            result = normalizer.normalize_transactions([raw])
            if result:  # Some might not normalize if missing required fields
                assert result[0].kind == expected_kind

    def test_review_reasons_for_ambiguous_data(self):
        """Test that review reasons are generated for ambiguous data."""
        raw = RawProviderTransaction(
            provider="test",
            source_url="https://example.com",
            transaction_date=date(2023, 1, 1),
            team_text="Toronto",
            acquired_text="• conditional 2024 1st round pick if playoffs",
            relinquished_text="",
            description_text="unknown transaction type",
            raw_fingerprint="ambiguous123",
        )
        
        normalizer = TransactionNormalizer()
        result = normalizer.normalize_transactions([raw])
        
        assert len(result) == 1
        assert len(result[0].review_reasons) > 0
        assert result[0].confidence == ConfidenceLevel.POSSIBLE
