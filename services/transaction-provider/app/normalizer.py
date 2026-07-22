"""Transaction normalization logic."""

import hashlib
import re
import uuid
from datetime import datetime, timezone

from app.models.normalized import (
    ConfidenceLevel,
    NormalizedAssetCandidate,
    NormalizedPlayerRef,
    NormalizedTeamRef,
    NormalizedTransactionCandidate,
    SourceReference,
    TransactionKind,
)
from app.models.raw import RawProviderTransaction


class TransactionNormalizer:
    """Normalize raw provider transactions into structured candidates."""

    # NHL team name mappings (simplified for MVP)
    TEAM_MAPPINGS = {
        "maple leafs": ("TOR", "Toronto Maple Leafs"),
        "toronto": ("TOR", "Toronto Maple Leafs"),
        "tor": ("TOR", "Toronto Maple Leafs"),
        "canadiens": ("MTL", "Montreal Canadiens"),
        "montreal": ("MTL", "Montreal Canadiens"),
        "mtl": ("MTL", "Montreal Canadiens"),
        "bruins": ("BOS", "Boston Bruins"),
        "boston": ("BOS", "Boston Bruins"),
        "bos": ("BOS", "Boston Bruins"),
        "rangers": ("NYR", "New York Rangers"),
        "new york rangers": ("NYR", "New York Rangers"),
        "nyr": ("NYR", "New York Rangers"),
        "blackhawks": ("CHI", "Chicago Blackhawks"),
        "chicago": ("CHI", "Chicago Blackhawks"),
        "chi": ("CHI", "Chicago Blackhawks"),
        "penguins": ("PIT", "Pittsburgh Penguins"),
        "pittsburgh": ("PIT", "Pittsburgh Penguins"),
        "pit": ("PIT", "Pittsburgh Penguins"),
        "red wings": ("DET", "Detroit Red Wings"),
        "detroit": ("DET", "Detroit Red Wings"),
        "det": ("DET", "Detroit Red Wings"),
        "oilers": ("EDM", "Edmonton Oilers"),
        "edmonton": ("EDM", "Edmonton Oilers"),
        "edm": ("EDM", "Edmonton Oilers"),
        "avalanche": ("COL", "Colorado Avalanche"),
        "colorado": ("COL", "Colorado Avalanche"),
        "col": ("COL", "Colorado Avalanche"),
        "lightning": ("TBL", "Tampa Bay Lightning"),
        "tampa bay": ("TBL", "Tampa Bay Lightning"),
        "tbl": ("TBL", "Tampa Bay Lightning"),
        "canucks": ("VAN", "Vancouver Canucks"),
        "vancouver": ("VAN", "Vancouver Canucks"),
        "van": ("VAN", "Vancouver Canucks"),
    }

    def normalize_transactions(
        self, raw_transactions: list[RawProviderTransaction]
    ) -> list[NormalizedTransactionCandidate]:
        """
        Normalize a list of raw transactions into structured candidates.
        
        Groups related rows, parses assets, resolves team identities.
        """
        if not raw_transactions:
            return []

        # For MVP, treat each row as a separate transaction candidate
        # Future: implement intelligent grouping for multi-row trades
        normalized = []
        for raw in raw_transactions:
            try:
                candidate = self._normalize_single_transaction(raw)
                if candidate:
                    normalized.append(candidate)
            except Exception as e:
                # Log but don't fail entire batch for one bad row
                print(f"Failed to normalize transaction: {e}")
                continue

        return normalized

    def _normalize_single_transaction(
        self, raw: RawProviderTransaction
    ) -> NormalizedTransactionCandidate | None:
        """Normalize a single raw transaction."""
        # Parse team
        team = self._normalize_team(raw.team_text or "")
        if not team:
            # Cannot process transaction without team
            return None

        # Parse assets
        acquired_assets = self._parse_assets(raw.acquired_text or "")
        relinquished_assets = self._parse_assets(raw.relinquished_text or "")
        all_assets = acquired_assets + relinquished_assets

        if not all_assets:
            # Skip transactions with no parsed assets
            return None

        # Classify transaction
        kind = self._classify_transaction(raw)

        # Determine confidence
        confidence, review_reasons = self._calculate_confidence(
            raw, all_assets, kind
        )

        # Create source reference
        source = SourceReference(
            id=str(uuid.uuid4()),
            provider=raw.provider,
            source_name="Pro Sports Transactions",
            source_url=raw.source_url,
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            record_fingerprint=raw.raw_fingerprint,
        )

        # Generate transaction ID
        transaction_id = self._generate_transaction_id(raw)

        return NormalizedTransactionCandidate(
            id=transaction_id,
            transaction_date=raw.transaction_date.isoformat(),
            kind=kind,
            teams=[team],
            assets=all_assets,
            source=source,
            confidence=confidence,
            review_reasons=review_reasons,
        )

    def _normalize_team(self, team_text: str) -> NormalizedTeamRef | None:
        """Normalize team name to canonical form."""
        normalized_text = team_text.strip().lower()
        
        if normalized_text in self.TEAM_MAPPINGS:
            abbr, full_name = self.TEAM_MAPPINGS[normalized_text]
            return NormalizedTeamRef(
                team_id=abbr,
                team_name=full_name,
                abbreviation=abbr,
            )

        # Team not in mapping, use raw text
        if team_text.strip():
            return NormalizedTeamRef(
                team_id=team_text.strip().upper()[:3],
                team_name=team_text.strip(),
                abbreviation=None,
            )

        return None

    def _parse_assets(self, asset_text: str) -> list[NormalizedAssetCandidate]:
        """Parse asset text into structured asset candidates."""
        if not asset_text or not asset_text.strip():
            return []

        assets: list[NormalizedAssetCandidate] = []

        # Split on bullet points
        lines = re.split(r"[•\n]", asset_text)

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Try to parse as draft pick first
            pick_asset = self._try_parse_draft_pick(line)
            if pick_asset:
                assets.append(pick_asset)
                continue

            # Otherwise treat as player
            player_asset = self._parse_player_asset(line)
            if player_asset:
                assets.append(player_asset)

        return assets

    def _try_parse_draft_pick(self, text: str) -> NormalizedAssetCandidate | None:
        """Try to parse text as a draft pick."""
        # Look for year + round patterns
        year_match = re.search(r"(\d{4})", text)
        round_match = re.search(r"(\d+)(st|nd|rd|th)\s+round", text.lower())

        if year_match and round_match:
            year = int(year_match.group(1))
            round_num = int(round_match.group(1))

            # Extract overall selection if present
            overall_match = re.search(r"(\d+)(st|nd|rd|th)\s+overall", text.lower())
            overall = int(overall_match.group(1)) if overall_match else None

            # Check for conditions
            conditions = None
            if "conditional" in text.lower() or "if" in text.lower():
                conditions = text

            return NormalizedAssetCandidate(
                id=str(uuid.uuid4()),
                kind="draft-pick",
                display_label=f"{year} Round {round_num} Pick",
                player_ref=None,
                draft_year=year,
                round=round_num,
                overall=overall,
                conditions_text=conditions,
                confidence=ConfidenceLevel.STRONG_MATCH
                if not conditions
                else ConfidenceLevel.POSSIBLE,
            )

        return None

    def _parse_player_asset(self, text: str) -> NormalizedAssetCandidate | None:
        """Parse text as a player asset."""
        # Remove parenthetical details
        clean_name = re.sub(r"\([^)]*\)", "", text).strip()

        if not clean_name or len(clean_name) < 3:
            return None

        # Create normalized player reference
        player_ref = NormalizedPlayerRef(
            player_name=clean_name,
            normalized_name=self._normalize_player_name(clean_name),
            nhl_player_id=None,  # Will be resolved by NHL API later
            position=None,
            confidence=ConfidenceLevel.STRONG_MATCH,
        )

        return NormalizedAssetCandidate(
            id=str(uuid.uuid4()),
            kind="player",
            display_label=clean_name,
            player_ref=player_ref,
            draft_year=None,
            round=None,
            confidence=ConfidenceLevel.STRONG_MATCH,
        )

    def _normalize_player_name(self, name: str) -> str:
        """Normalize player name for matching."""
        # Convert to lowercase, preserve hyphens and apostrophes
        normalized = name.lower().strip()
        # Remove extra whitespace
        normalized = " ".join(normalized.split())
        return normalized

    def _classify_transaction(self, raw: RawProviderTransaction) -> TransactionKind:
        """Classify transaction type based on text content."""
        text = (
            f"{raw.acquired_text} {raw.relinquished_text} {raw.description_text}"
        ).lower()

        if "traded" in text or ("acquired" in text and "relinquished" in raw.relinquished_text):
            return TransactionKind.TRADE
        if "waiver" in text:
            return TransactionKind.WAIVER
        if "signed" in text and not raw.relinquished_text:
            return TransactionKind.SIGNING
        if "draft" in text:
            return TransactionKind.DRAFT

        return TransactionKind.OTHER

    def _calculate_confidence(
        self,
        raw: RawProviderTransaction,
        assets: list[NormalizedAssetCandidate],
        kind: TransactionKind,
    ) -> tuple[ConfidenceLevel, list[str]]:
        """Calculate overall confidence and review reasons."""
        review_reasons = []

        # Check for missing details
        if not raw.team_text:
            review_reasons.append("missing-team")
        if not assets:
            review_reasons.append("no-assets-parsed")

        # Check for complex conditions
        for asset in assets:
            if asset.conditions_text:
                review_reasons.append("pick-condition-complex")
                break

        # Check for ambiguous classification
        if kind == TransactionKind.OTHER:
            review_reasons.append("transaction-type-unclear")

        # Determine overall confidence
        if review_reasons:
            return ConfidenceLevel.POSSIBLE, review_reasons

        return ConfidenceLevel.STRONG_MATCH, []

    def _generate_transaction_id(self, raw: RawProviderTransaction) -> str:
        """Generate deterministic transaction ID."""
        content = f"{raw.transaction_date.isoformat()}|{raw.raw_fingerprint}"
        hash_value = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"txn_{hash_value}"
