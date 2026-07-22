# Transaction Normalization

This document describes how PuckTree normalizes raw transaction data from the `pro_sports_transactions` package into the stable domain model consumed by the web application.

## Raw Provider Fields

The `pro_sports_transactions` package returns transactions as pandas DataFrames with the following columns:

| Field          | Type   | Description                                                               |
| -------------- | ------ | ------------------------------------------------------------------------- |
| `Date`         | string | Transaction date in YYYY-MM-DD format                                     |
| `Team`         | string | Team name or abbreviation                                                 |
| `Acquired`     | string | Text listing acquired assets, typically prefixed with bullet points       |
| `Relinquished` | string | Text listing relinquished assets, typically prefixed with bullet points   |
| `Notes`        | string | Additional transaction details, conditions, or context                    |

### Example Raw Record

```text
Date: 2023-06-28
Team: Maple Leafs
Acquired: • 2023 1st round draft pick (28th overall-Matthew Knies)
Relinquished: 
Notes: traded 2023 1st round draft pick (38th overall-Fraser Minten) to Vancouver
```

## Normalization Process

### 1. Raw Record Capture

Convert DataFrame rows to `RawProviderTransaction` Pydantic models:

```python
@dataclass
class RawProviderTransaction:
    provider: str = "pro_sports_transactions"
    source_url: str | None
    transaction_date: date
    team_text: str | None
    acquired_text: str | None
    relinquished_text: str | None
    description_text: str
    raw_fingerprint: str
```

The `raw_fingerprint` is a deterministic hash of the normalized date, team, and sorted asset tokens to detect duplicates.

### 2. Player Name Parsing

Player names appear in the `Acquired` and `Relinquished` fields, often with bullet points:

- `• Connor McDavid`
- `• Auston Matthews`
- `• Jean-Gabriel Pageau`

Parsing logic:

1. Split on bullet points (`•`, `-`, `*`)
2. Extract name before parenthetical details
3. Normalize punctuation: preserve hyphens, apostrophes, and accents
4. Trim whitespace
5. Handle "and" conjunctions for multiple players

**Known limitations:**

- Cannot distinguish between different players with identical names without additional context
- Position information is not consistently available in raw text
- Nicknames or alternate spellings require NHL player search resolution

### 3. Draft Pick Parsing

Draft picks appear in multiple formats:

- `2023 1st round draft pick (28th overall-Matthew Knies)`
- `2024 2nd round pick`
- `conditional 2025 3rd round pick`
- `rights to 2022 4th round pick (105th overall)`

Parsing logic:

1. Extract year using regex: `(\d{4})`
2. Extract round: `1st`, `2nd`, `3rd`, `4th`, `5th`, `6th`, `7th`
3. Extract overall selection from parentheses when present
4. Extract selected player name after dash in parentheses
5. Detect condition keywords: "conditional", "if", "protected"

**Known limitations:**

- Complex conditions (e.g., "1st round pick if team misses playoffs, otherwise 2nd") are stored as text, not structured
- Original team ownership is inferred from context but not always explicit
- Later pick trades require separate lookups to establish lineage

### 4. Team Name Resolution

Team names appear inconsistently:

- Full name: `Toronto Maple Leafs`
- City: `Toronto`
- Abbreviation: `TOR`
- Historical: `Quebec Nordiques` (now Colorado Avalanche)

Resolution strategy:

1. Maintain a canonical team dictionary with historical mappings
2. Match using normalized string comparison
3. Use transaction date to resolve relocated franchises
4. Store both the raw provider text and resolved team ID

**Known limitations:**

- Relocation edge cases (e.g., Atlanta Thrashers to Winnipeg Jets) require date-aware franchise mapping
- Team abbreviations are not standardized across all sources

### 5. Transaction Grouping

A single real-world trade may appear as multiple rows in the source:

```text
Row 1: Team A acquired X, relinquished Y
Row 2: Team B acquired Y, relinquished X
```

Grouping logic:

1. Group by exact transaction date
2. Group by overlapping team names
3. Group by matching player or asset tokens
4. **Never group based solely on date**

Generate a deterministic event fingerprint: `sha256(date + sorted(teams) + sorted(assets))`

**Known limitations:**

- Same-day trades between the same teams can be incorrectly grouped
- Three-team trades require explicit multi-row detection
- Separate "trade announced" and "trade completed" rows must be deduplicated

### 6. Transaction Classification

Classify records into transaction kinds:

- **trade**: Mutual asset exchange between teams
- **waiver**: Waiver claim or release
- **signing**: Free agent signing or contract extension
- **draft**: Draft selection
- **other**: Assignment, recall, or other movement

Classification heuristics:

- Contains "traded" or "acquired" + "relinquished": **trade**
- Contains "claimed off waivers": **waiver**
- Contains "signed" + no relinquished assets: **signing**
- Contains "draft" or "drafted": **draft**
- Default: **other**

**Known limitations:**

- Ambiguous wording (e.g., "acquired rights to") may misclassify
- Conditional trades lack a distinct classification

### 7. Confidence Scoring

Assign confidence levels to each normalized element:

- **verified** (0.95+): Unambiguous, cross-referenced with NHL API
- **strong-match** (0.75-0.94): High confidence based on context and pattern matching
- **possible** (0.50-0.74): Plausible but requires user confirmation
- **manual** (N/A): User-entered or corrected

Factors that lower confidence:

- Missing details (e.g., draft pick without year)
- Ambiguous player names
- Complex conditions
- Historical team name without date resolution

### 8. Review Reasons

Transactions marked for review include structured reasons:

- `identity-ambiguous`: Multiple players match the name
- `pick-condition-complex`: Draft pick has conditions requiring review
- `team-historical`: Historical team name needs verification
- `missing-details`: Key information is incomplete
- `date-inferred`: Transaction date is approximate
- `multi-asset-complex`: Many assets may indicate grouping error

## Output Schema

Final normalized output:

```typescript
interface NormalizedTransactionCandidate {
  id: string;
  transactionDate: string;
  kind: TransactionKind;
  teams: NormalizedTeamRef[];
  assets: NormalizedAssetCandidate[];
  source: SourceReference;
  confidence: ConfidenceLevel;
  reviewReasons: string[];
}
```

## Unresolved Cases

The following cases require additional provider sources or user input:

1. **Three-team trades**: Current grouping may not reliably detect all sides
2. **Conditional pick resolution**: Only simple conditions are parsed; complex conditions remain text
3. **Player identity**: Disambiguation relies on NHL API, which may not cover all historical players
4. **Draft pick lineage**: Original ownership and later trades of picks require separate lookups
5. **Transaction amendments**: Retroactive corrections or amended trades are not automatically detected
6. **Minor league assignments**: May appear as transactions but are often noise for NHL trade trees

## Future Improvements

- Add NHL API integration for player identity resolution
- Add team franchise history table with relocation dates
- Improve three-team trade detection
- Add draft pick lineage tracking
- Add configurable normalization rules per operator

---

**Document version:** 0.1  
**Last updated:** 2026-07-22  
**Normalization code:** `services/transaction-provider/app/normalizer.py`
