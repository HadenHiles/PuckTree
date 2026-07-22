# PuckTree Transaction Fixtures

This directory contains sanitized, representative transaction data used for:

- Local development without external provider access
- Automated tests that must not depend on network requests
- Public demonstrations during provider outages
- Fixture mode for contributors without Unflare service access

## Provenance

All fixture data in this directory has been:

1. Captured from the `pro_sports_transactions` package during controlled test runs
2. Sanitized to remove cookies, request details, and unrelated source content
3. Manually verified against publicly available NHL transaction records
4. Stored in a stable JSON format that matches the `RawProviderTransaction` schema

## DO NOT COMMIT

The following should never be added to this directory:

- Raw HTML source code from Pro Sports Transactions
- Unflare service cookies or configuration
- Downloaded NHL player headshots or team logos
- API keys, credentials, or private data
- Complete historical datasets

## Fixture Files

### nhl/sample_players.json

Contains sanitized transaction records for a small set of notable NHL players used in tests and the diagnostic page. Each entry includes:

- Player name
- Transaction date
- Team
- Acquired and relinquished text
- Notes
- Source reference

These fixtures represent common transaction patterns:

- Simple two-team trades
- Multi-asset trades
- Trades involving draft picks
- Players with punctuation in names
- Historical team name variations

## Updating Fixtures

When the `pro_sports_transactions` package format changes or additional test coverage is needed:

1. Use the fixture capture script: `python services/transaction-provider/scripts/capture_fixtures.py`
2. Manually review captured data for sensitive information
3. Verify against public sources
4. Update this README with the capture date and package version

**Last updated:** 2026-07-22  
**Package version:** pro_sports_transactions 1.1.2
