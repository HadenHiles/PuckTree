"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def sample_raw_transaction_data():
    """Sample raw transaction data for testing."""
    return {
        "Date": "2023-06-28",
        "Team": "Maple Leafs",
        "Acquired": "• Auston Matthews",
        "Relinquished": "• 2023 1st round draft pick (28th overall)",
        "Notes": "traded with Vancouver",
    }


@pytest.fixture
def sample_multi_asset_trade():
    """Sample multi-asset trade data."""
    return {
        "Date": "2023-07-01",
        "Team": "Penguins",
        "Acquired": "• Sidney Crosby\n• 2024 2nd round pick",
        "Relinquished": "• Evgeni Malkin\n• conditional 2025 3rd round pick",
        "Notes": "three-team trade",
    }


@pytest.fixture
def sample_draft_pick_text():
    """Sample draft pick text variations."""
    return [
        "2023 1st round draft pick (28th overall-Matthew Knies)",
        "2024 2nd round pick",
        "conditional 2025 3rd round pick if team makes playoffs",
        "rights to 2022 4th round pick (105th overall)",
    ]


@pytest.fixture
def sample_player_names():
    """Sample player names with various punctuation."""
    return [
        "Connor McDavid",
        "Jean-Gabriel Pageau",
        "Pierre-Luc Dubois",
        "Marc-Édouard Vlasic",
        "T.J. Oshie",
        "P.K. Subban",
    ]
