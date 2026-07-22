"""Normalized transaction models."""

from datetime import date
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class ConfidenceLevel(str, Enum):
    """Confidence in the accuracy of a normalized value."""

    VERIFIED = "verified"
    STRONG_MATCH = "strong-match"
    POSSIBLE = "possible"
    MANUAL = "manual"


class TransactionKind(str, Enum):
    """Classification of transaction type."""

    TRADE = "trade"
    WAIVER = "waiver"
    SIGNING = "signing"
    DRAFT = "draft"
    OTHER = "other"


class SourceReference(BaseModel):
    """Reference to the original data source."""

    id: str
    provider: str
    source_name: str
    source_url: str | None
    retrieved_at: str  # ISO 8601 timestamp
    record_fingerprint: str | None


class NormalizedTeamRef(BaseModel):
    """Normalized team reference."""

    team_id: str
    team_name: str
    abbreviation: str | None = None


class NormalizedPlayerRef(BaseModel):
    """Normalized player reference with identity resolution status."""

    player_name: str
    normalized_name: str
    nhl_player_id: str | None = None
    position: str | None = None
    confidence: ConfidenceLevel


class NormalizedAssetCandidate(BaseModel):
    """A normalized asset involved in a transaction."""

    id: str
    kind: Literal["player", "draft-pick", "custom"]
    display_label: str

    # Player-specific fields
    player_ref: NormalizedPlayerRef | None = None

    # Draft pick-specific fields
    draft_year: int | None = None
    round: int | None = None
    overall: int | None = None
    conditions_text: str | None = None

    confidence: ConfidenceLevel


class NormalizedTransactionCandidate(BaseModel):
    """A normalized transaction candidate ready for the web application."""

    id: str
    transaction_date: str  # ISO 8601 date
    kind: TransactionKind
    teams: list[NormalizedTeamRef]
    assets: list[NormalizedAssetCandidate]
    source: SourceReference
    confidence: ConfidenceLevel
    review_reasons: list[str] = Field(default_factory=list)


class TransactionSearchResponse(BaseModel):
    """Response containing normalized transaction search results."""

    query: str
    transactions: list[NormalizedTransactionCandidate]
    is_partial: bool
    provider_status: Literal["success", "partial", "failed", "disabled"]
    provider_message: str | None = None
    retrieved_at: str  # ISO 8601 timestamp
