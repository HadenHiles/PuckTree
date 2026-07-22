# PuckTree

**Follow every branch of a hockey trade.**

PuckTree is an open-source React application that automatically discovers and visualizes NHL trade trees. Search for a player, select a trade, and watch the tree generate. Expand branches, verify sources, correct ambiguous data, and export presentation-quality graphics.

---

## Project Status

**Current milestone:** Milestone 0 - Provider Spike  
**Status:** In development  
**Not ready for public use**

This project is under active development. The data source integration and normalization contract are being proven before building the full interactive UI.

---

## Architecture

PuckTree is a pnpm monorepo containing:

- **apps/web**: Next.js App Router application (React, TypeScript, Tailwind)
- **services/transaction-provider**: Python FastAPI service for transaction discovery and normalization
- **packages/domain**: Shared TypeScript types
- **packages/tsconfig**: Shared TypeScript configuration
- **data/fixtures**: Sanitized transaction fixtures for testing and development

### Key Design Principles

1. Domain models remain independent from React Flow graph nodes
2. Browser never consumes raw provider data; only normalized JSON
3. Provider abstraction allows fixture mode, disabled mode, and future alternative sources
4. Cache-first responses; no user interaction depends on live external lookups
5. User-edited fields are protected from provider refresh overwrites
6. Source provenance and confidence are first-class concerns

---

## Data Sources

PuckTree uses:

- **NHL public web endpoints** for player search, identity, headshots, and team logos (server-side only)
- **pro_sports_transactions** Python package for NHL transaction history

The `pro_sports_transactions` package is MIT licensed, but its underlying information remains subject to rights reserved by Pro Sports Transactions. PuckTree treats this as a replaceable provider and includes fixture mode for development and testing without external access.

**Legal position:** A disclaimer does not grant a data license. Operators configuring external providers are responsible for compliance with applicable terms. Do not commit raw source data, downloaded images, cookies, or credentials.

---

## Prerequisites

### Node.js and pnpm

- Node.js 20+
- pnpm 9+

### Python

- Python 3.11+
- pip or poetry

### External Services (optional)

For live `pro_sports_transactions` access:

- **Unflare service**: Required for reliable Cloudflare bypass
  - See: <https://github.com/iamyegor/Unflare>
  - Typically runs on `http://localhost:5002`

**Fixture mode works without Unflare.** The public demo and tests default to fixture mode.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pucktree.git
cd pucktree
```

### 2. Install Node dependencies

```bash
pnpm install
```

### 3. Set up Python service

```bash
cd services/transaction-provider
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment

Copy the example environment file:

```bash
cp .env.example .env
```

For local development with fixture mode (no external services required):

```env
TRANSACTION_PROVIDER=fixture
```

For live Pro Sports Transactions access (requires Unflare):

```env
TRANSACTION_PROVIDER=pro_sports
UNFLARE_SERVICE_URL=http://localhost:5002/scrape
```

---

## Development

### Run the Python provider service

```bash
cd services/transaction-provider
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Health check: <http://localhost:8000/health>

### Run the Next.js web application

```bash
pnpm dev
```

Diagnostic page: <http://localhost:3000/diagnostics> (development only)

### Run tests

Python tests:

```bash
cd services/transaction-provider
pytest
```

TypeScript type checking:

```bash
pnpm type-check
```

---

## Project Structure

```text
pucktree/
├── apps/
│   └── web/                      # Next.js application
├── services/
│   └── transaction-provider/     # Python FastAPI service
├── packages/
│   ├── domain/                   # Shared TypeScript types
│   └── tsconfig/                 # Shared TypeScript config
├── data/
│   └── fixtures/                 # Sanitized provider fixtures
├── docs/
│   └── normalization.md          # Provider normalization details
├── PUCKTREE_PRODUCT_SPEC.md      # Complete product specification
└── README.md
```

---

## Roadmap

- [x] Milestone 0: Provider spike and normalization contract
- [ ] Milestone 1: Magic-path prototype (search, pick trade, generate tree)
- [ ] Milestone 2: Branch discovery and expansion
- [x] Milestone 3: Correction-grade editor
- [ ] Milestone 4: Share and presentation exports
- [ ] Milestone 5: Public-demo hardening

See `PUCKTREE_PRODUCT_SPEC.md` for complete feature and milestone details.

---

## Contributing

Contributions are welcome once the provider spike is complete and contribution guidelines are published.

Before contributing:

1. Read `PUCKTREE_PRODUCT_SPEC.md` to understand scope and design principles
2. Do not commit raw third-party datasets, downloaded images, or credentials
3. Default tests to fixture mode; do not require live external access
4. Maintain TypeScript strict mode and Python type hints

---

## License

Code: MIT License (see LICENSE file)

**Important:** The MIT license applies to PuckTree's source code only. It does not grant rights to third-party data, NHL player images, team logos, or other external content. Operators are responsible for configuring and using external providers in accordance with applicable terms.

---

## Disclaimer

PuckTree is an independent open-source project and is not affiliated with the NHL, its teams, or Pro Sports Transactions. Transaction information may be incomplete, delayed, or incorrect. Imported records are provided for research and visualization and should be verified against the linked source before publication. Team marks, player images, and third-party data remain the property of their respective owners.

---

## Acknowledgments

- Frank Marousek and contributors to Pro Sports Transactions for compiling transactional hockey data
- The `pro_sports_transactions` Python package maintainers
- The React, Next.js, FastAPI, and Python communities

---

**Project maintained by:** [Your Name]  
**Repository:** <https://github.com/yourusername/pucktree>  
**Product specification:** PUCKTREE_PRODUCT_SPEC.md
