# PuckTree Product Specification

**Specification version:** 0.3 **Working name:** PuckTree **Tagline:** Follow every branch of a hockey trade. **Product type:** Open-source React web application with automated trade discovery **Primary audience:** Hockey fans,
writers,
podcasters,
YouTube producers,
social media teams,
and hockey researchers **Initial showcase audience:** A knowledgeable hockey creator who should be able to use the product without instructions and immediately understand its value **Primary engineering goal:** Demonstrate strong modern React product engineering through a polished,
visual,
data-driven workflow --- ## 1. Product Summary PuckTree is an interactive hockey trade-tree explorer and editor. A user searches for an NHL player,
selects one of the player's known trades, and PuckTree automatically creates a visual trade tree containing the teams and assets involved. PuckTree then finds likely later transactions involving those assets and presents them as one-click branch suggestions.

The core experience is:>Search for a player,
choose a trade,
generate the tree,
expand interesting branches,
verify the sources,
and export the result. PuckTree should feel significantly faster and more enjoyable than researching transactions across multiple websites and manually assembling a diagram. Automatic discovery provides the magic. Guided confirmation,
source links,
and manual editing keep the result understandable and correctable. PuckTree is not intended to become a complete hockey operations platform or a commercial transaction database. It is a focused,
highly polished open-source product that solves one visible problem well. --- ## 2. Product Thesis Manual trade-tree creation involves several repetitive steps: 1. Find the original trade. 2. Identify every player and draft pick included. 3. Determine what happened to each asset later. 4. Resolve players selected with acquired draft picks. 5. Repeat the research for every new branch. 6. Draw the relationships manually. 7. Redesign the graphic when a new branch is added. Most of that work is mechanical. PuckTree should automate the mechanical research and layout while leaving the user in control of ambiguous hockey history. The product succeeds when a user can create a credible,
attractive first tree in less than a minute and understand how to expand it without reading documentation. --- ## 3. Product Goals 1. Make the first useful result appear quickly after selecting a player and trade. 2. Automatically discover the original transaction and likely downstream player connections. 3. Present ambiguous or lower-confidence connections as suggestions rather than silently asserting them as fact. 4. Make player photos,
team identity,
dates,
and visual branches carry the interface instead of large blocks of text. 5. Make every imported transaction traceable to its source. 6. Preserve manual editing as a first-class correction and fallback mechanism. 7. Support attractive exports suitable for social posts,
articles,
presentations,
and videos. 8. Remain reliable when an external source is slow,
unavailable,
incomplete,
or changes format. 9. Keep React prominent through autocomplete,
asynchronous workflows,
graph exploration,
progressive disclosure,
complex state,
responsive UI,
and accessible interaction. 10. Be polished enough to share directly with a hockey media professional as a real product demonstration. --- ## 4. Success Criteria for the Shareable MVP The MVP is ready to share when all of the following are true: - A first-time user can search for a recognizable NHL player using a photo-backed autocomplete. - The user can select a known trade and see a generated tree without manually entering its primary assets. - At least one branch can be expanded automatically for each included sample tree. - The interface clearly distinguishes verified,
suggested,
ambiguous,
and manually entered information. - Every imported transaction can reveal its source and retrieval date. - The user can correct names,
teams,
assets,
dates,
and relationships. - A tree can be exported as a sharp 16:9 PNG suitable for use in a video or social post. - The product includes at least three polished sample trees,
including one Toronto Maple Leafs-related example. - Loading,
empty,
partial-data,
and provider-failure states feel intentional. - The main workflow works on modern desktop browsers and remains usable on a tablet. - The public demo does not depend on a live third-party scrape completing during every user interaction. - The repository has setup instructions,
architecture documentation,
tests,
screenshots,
and a clear disclaimer. ### Target usability metrics These are design targets,
not analytics requirements: - Player search results begin appearing within 300 ms when cached. - A cached trade list appears within 500 ms. - A cached tree generates within 1 second after selection. - An uncached provider lookup shows visible progress immediately and should return or fail gracefully within 15 seconds. - First tree creation should require no more than three deliberate actions after landing: 1. Search player. 2. Select player. 3. Select trade. --- ## 5. Non-Goals for the Shareable MVP PuckTree MVP will not: - Determine which team won a trade. - Calculate salary-cap impact or contract value. - Provide betting,
fantasy,
or predictive analysis. - Guarantee complete or perfectly accurate historical coverage. - Automatically publish user-created trees. - Require authentication. - Support collaborative editing. - Support all professional or junior hockey leagues. - Attempt to replace a source transaction database. - Automatically accept every inferred draft-pick connection. - Support arbitrary freeform diagramming unrelated to hockey trades. - Package NHL or team image assets in the repository. - Hide the fact that transaction data may be incomplete or sourced from a third party. --- ## 6. Target Users ### 6.1 Hockey fan Wants to understand how a famous trade continued producing players,
picks,
and later trades years after the original transaction. ### 6.2 Hockey creator Produces podcasts,
YouTube videos,
social posts,
or livestreams and needs a quick,
accurate-looking visual that can be explained on screen. ### 6.3 Hockey writer or researcher Wants to explore connections,
verify dates,
and export a graphic without manually drawing the tree. ### 6.4 Team communications or local media staff Needs an understandable transaction-history visual without investing in an enterprise scouting or data product. ### 6.5 Software hiring manager Should immediately see evidence of React expertise,
product judgment,
UX skill,
data normalization,
asynchronous state handling,
testing,
and scope control. --- ## 7. Core User Experience ### 7.1 Landing experience The landing page should be visual and useful immediately. Primary content: - PuckTree logo and short tagline. - Large player search combobox with placeholder: **Search any NHL player**. - A subtle line of helper text: **Pick a player,
choose a trade,
and follow what happened next.** - Three visual sample-tree cards. - Secondary action: **Build manually**. - Small links to About,
Data Sources,
and GitHub. Do not begin with a long explanation or feature list. ### 7.2 Player search As the user types: - Debounce remote search by approximately 200 ms. - Search by full name,
partial name,
alternate spelling where available,
and normalized punctuation. - Show up to eight results. - Each result should include: - Player headshot or avatar fallback. - Full name. - Position. - Active or most relevant team badge. - Career years when available. - Keyboard navigation must work. - The menu must remain readable and usable on mobile. - A final option must always be available: **Enter player manually**. Selecting a player should transition directly into trade discovery without opening a dense profile page. ### 7.3 Trade selection After choosing a player,
show a compact trade picker: - Player hero card at the top. - Heading: **Choose a trade to trace**. - Each trade card contains: - Date. - Team badges. - A concise visual summary of the player moving between teams. - Number of known included assets. - Number of discovered follow-up branches,
when cached. - Source status. - Sort newest first by default. - Allow oldest-first sorting. - Mark low-confidence grouped transactions with **Review details**. - Provide **Add a missing trade manually** at the bottom. Do not display raw source descriptions as the primary card content. ### 7.4 Automatic tree generation After a trade is selected: 1. Navigate to the tree editor. 2. Render the selected trade in the centre. 3. Place each team in a clear visual lane. 4. Add all confidently parsed assets. 5. Load player headshots and team imagery. 6. Fit the complete initial transaction into view. 7. Animate the tree into position using restrained motion. 8. Display a short toast: **Trade tree created. Select a branch to keep tracing it.** The user should never need to manually recreate the original trade unless the source data is missing or malformed. ### 7.5 Guided branch discovery Assets with known or possible later activity display a compact branch indicator: - **1 next trade** - **2 possible connections** - **Pick outcome found** - **Needs review** Selecting the indicator opens a lightweight connection tray near the node or in the inspector. Each suggestion includes: - Transaction date. - Destination or involved teams. - A short asset summary. - Confidence label. - Source link. - Primary action: **Add branch**. - Secondary actions: **Review**,
**Dismiss**,
or **Edit before adding**. A confirmed suggestion expands the graph,
runs layout only on the affected branch,
and moves focus to the new transaction. Do not automatically add every later trade. The user controls which branches appear. ### 7.6 Manual correction and fallback At any point,
the user can: - Edit a transaction date. - Change a team. - Rename or replace an asset. - Attach the correct player record. - Convert a custom asset into a player or draft pick. - Add a missing asset. - Remove a false connection. - Add an entirely manual branch. - Mark a branch as complete. Imported fields should show a subtle source indicator. Manual edits should not be overwritten by later provider refreshes. ### 7.7 Presentation and export The user can enter Presentation mode: - Hide editing chrome. - Use a clean background. - Fit the selected tree or branch. - Highlight one path while dimming others. - Step through transactions using previous and next controls. Export presets: - 1920 x 1080,
16:9 for YouTube and presentations. - 1200 x 675,
social landscape. - 1080 x 1080,
square. - Current viewport. - Full tree. Version 1 export format: - PNG required. - SVG optional if it does not delay launch. - JSON required for backup and sharing. Optional export controls: - Transparent background. - Include title. - Include source footer. - Include PuckTree watermark,
enabled by default but removable. --- ## 8. Information Architecture and Routes ### Public routes - `/` - Landing page,
search,
recent local trees,
and samples. - `/player/[playerId]` - Lightweight player trade picker. Can also be rendered in a modal transition. - `/tree/[treeId]` - Interactive editor. - `/share/[shareId]` - Read-only shared tree with **Make a copy**. - `/samples/[slug]` - Published sample tree. - `/about` - Product explanation,
privacy notes,
and project links. - `/data-sources` - Data provenance,
limitations,
attribution,
and disclaimer. ### Web API routes - `GET /api/players/search?q=` - Normalized player autocomplete. - `GET /api/players/:playerId` - Player identity,
headshot,
team,
and profile metadata. - `GET /api/players/:playerId/trades` - Cached normalized trade summaries. - `POST /api/players/:playerId/trades/refresh` - Request provider refresh,
rate limited. - `GET /api/trades/:tradeId` - Normalized trade and included assets. - `GET /api/assets/:assetId/connections` - Suggested later transactions or pick outcome. - `POST /api/trees/share` - Store a shareable tree document if hosted sharing is enabled. - `GET /api/health` - Web and provider health summary without exposing secrets. ### Python provider service routes These routes remain internal and are accessed through the Next.js server layer: - `GET /internal/providers/health` - `GET /internal/transactions/search?playerName=` - `POST /internal/transactions/normalize` - `POST /internal/catalog/warm` - `POST /internal/catalog/refresh` Do not expose provider credentials,
request-handler configuration,
or raw scraped responses to the browser.

---

## 9. Data Sources and Provider Strategy

### 9.1 NHL identity provider

Use the NHL's current public web endpoints for identity and presentation where available:

- Player search.
- NHL player IDs.
- Player names.
- Position.
- Current or historical team context.
- Headshots and hero images.
- Team names and logos.
- Draft details when available.

All NHL responses must be normalized behind an adapter. React components must never depend on raw upstream response shapes.

### 9.2 Transaction provider

Use the `pro_sports_transactions` Python package as the initial transaction provider. The package provides programmatic access to Pro Sports Transactions data and supports NHL movement records. Its own documentation states that the package is MIT licensed while the underlying information remains subject to rights reserved by Pro Sports Transactions. The package also documents that reliable requests may require a separately operated request handler because direct requests can be blocked. PuckTree must treat this as a replaceable provider,
not as the permanent domain model. Required provider interface:

```python
from datetime import date
from typing import Protocol

class TransactionProvider(Protocol):
    async def search_player_transactions(self,
      player_name: str,
      start_date: date | None=None,
      end_date: date | None=None,
    ) -> list["RawProviderTransaction"]: ...
```

Provider implementations:

- `ProSportsTransactionsProvider`
- `FixtureTransactionProvider`
- `DisabledTransactionProvider`

Future providers can be added without changing the React application or normalized API.

### 9.3 Runtime strategy

Do not make every user interaction depend on a live provider request. Use a hybrid cache-first strategy:

1. Search the normalized PuckTree catalog first.
2. Return cached trades immediately when available.
3. If the player has no cached transactions,
optionally request an on-demand provider lookup.
4. Show progress and preserve the user's selected player while the lookup runs.
5. Normalize and cache successful results.
6. Return cached stale data if the provider is unavailable.
7. Allow the user to continue manually when no provider data is available.

### 9.4 Prewarmed catalog

The public showcase must ship with a prewarmed catalog containing:

- All players used in sample trees.
- A useful selection of current NHL stars.
- A strong selection of notable Toronto Maple Leafs players and trades.
- At least 100 recognizable players before the first public share.
- At least 25 fully validated anchor trades.
- At least 10 anchor trades with one or more validated downstream branches.

### 9.5 Data snapshots

Once data is added to a PuckTree document,
save a display snapshot:

- Player ID and name.
- Headshot URL.
- Team identity.
- Transaction date.
- Asset summary.
- Source reference.
- Provider record ID or deterministic fingerprint.
- Retrieval timestamp.
- Confidence.

Existing trees must continue to render if an upstream provider changes or becomes unavailable.

---

## 10. Legal, Attribution, and Accuracy Position

### 10.1 Important limitation

A disclaimer does not grant a licence to use or redistribute third-party data. It only communicates limitations and allocates responsibility between the project and its users. PuckTree should still be architected so the transaction provider can be disabled or replaced. Before broad public promotion or commercial hosting,
the operator should review the source site's terms and seek permission where appropriate.

### 10.2 In-product disclaimer

Display concise language in the About and Data Sources pages:

>PuckTree is an independent open-source project and is not affiliated with the NHL,
>its teams,
or Pro Sports Transactions. Transaction information may be incomplete,
delayed,
or incorrect. Imported records are provided for research and visualization and should be verified against the linked source before publication. Team marks,
player images,
and third-party data remain the property of their respective owners. Do not show this full paragraph during every interaction. Use a small **Data sources and limitations** link in the footer and source drawer. ### 10.3 Repository disclaimer The repository must state: - The source code licence does not grant rights to third-party data or imagery. - Operators are responsible for configuring and using external providers in accordance with applicable terms and laws. - The public project does not guarantee accuracy,
completeness,
availability,
or fitness for a particular purpose. - Contributors should not commit raw third-party datasets,
downloaded player images,
team logos,
cookies,
or provider credentials.

### 10.4 Source attribution

Every imported transaction must include:

- Source name.
- Source URL when available.
- Retrieval date.
- Provider name.
- Optional raw-text excerpt kept server-side for debugging,
not necessarily exposed publicly.

Exports may include a compact footer:

>Transaction data sourced through linked public records. Verify before publication.

---

## 11. Transaction Normalization

### 11.1 Raw provider records

The provider adapter may receive HTML-derived rows or package-specific objects. Capture representative fixtures before finalizing parsing code. Do not invent field names that the package does not expose. The adapter must convert raw records into a stable internal shape:

```python
from dataclasses import dataclass
from datetime import date
from typing import Literal

@dataclass
class RawProviderTransaction:
    provider: str
    source_url: str | None
    transaction_date: date
    team_text: str | None
    acquired_text: str | None
    relinquished_text: str | None
    description_text: str
    raw_fingerprint: str

@dataclass
class NormalizedTransactionCandidate:
    id: str
    transaction_date: date
    kind: Literal["trade",
        "waiver",
        "signing",
        "draft",
        "other"]
    teams: list["NormalizedTeamRef"]
    assets: list["NormalizedAssetCandidate"]
    source: "SourceReference"
    confidence: float
    review_reasons: list[str]
```

### 11.2 Grouping records into trades

A single real-world trade may appear as multiple rows. Group candidates using:

- Exact transaction date.
- Normalized involved team names.
- Source consistency.

### 11.3 Transaction classification

### 11.4 Player identity resolution

Resolve provider text to NHL player identity using:

1. Exact normalized full-name match.
2. NHL player search candidate match.
3. Career-era overlap.
4. Team context.
5. Position context when available.

Store:

- Provider display name.
- Normalized name.
- NHL player ID when resolved.
- Match confidence.
- Resolution method.

Never silently attach a player when multiple candidates remain plausible. Mark the asset **Identity needs review**.

### 11.5 Team identity resolution

Maintain a canonical historical team dictionary containing:

- Current team name.
- Historical names.
- City aliases.
- Abbreviations.
- Franchise identity.
- Active date range.
- Logo URL when available.

Use transaction date to distinguish historical team names and relocations.

### 11.6 Draft pick parsing

Normalize draft picks into:

```ts
export type DraftPickAsset= {
  id: string;
  kind: "draft-pick";
  draftYear: number | null;
  round: number | null;
  overall: number | null;
  originalTeamId: string | null;
  currentOwnerTeamId: string | null;
  conditionsText: string | null;
  selectedPlayerId: string | null;
  selectedPlayerSnapshot: PlayerSnapshot | null;
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
}
```

Automatic pick lineage is only considered verified when the dataset or an additional source explicitly establishes the pick identity. A same-year and same-round match alone is not enough.

### 11.7 Confidence levels

Use four user-facing confidence levels:

- **Verified**: Direct source mapping with unambiguous identities.
- **Strong match**: High-confidence normalized match with supporting context.
- **Possible**: Plausible but ambiguous connection requiring review.
- **Manual**: Entered or corrected by the user.

Internally store a numeric score from 0 to 1 plus structured reasons. Do not display unexplained percentages to users.

---

## 12. Connection Discovery Algorithm

### 12.1 Player branches

For a player asset:

1. Find later trade records involving the resolved player ID or normalized name.
2. Exclude the transaction that introduced the asset to the current branch.
3. Sort by date.
4. Score identity and event confidence.
5. Return the earliest later trade as the primary suggestion.
6. Keep additional later trades available when the player changed teams through non-trade movement.

### 12.2 Draft-pick branches

For a draft-pick asset:

1. Look for explicit references to the year,
round,
original team,
and conditions.
2. Look for a resolved overall selection or selected player.
3. Prefer explicit source links over inferred ownership.
4. Return ambiguous candidates as **Possible**.
5. Require confirmation before attaching a selected player or later trade.

### 12.3 Player-selected-with-pick branch

When a selected player is resolved:

- Add a visual pick outcome connection.
- Preserve the pick node instead of replacing it.
- Display the selected player's photo beside the pick.
- Allow the selected player's later trades to become new suggestions.

### 12.4 Cycle prevention

Trade trees can contain reacquired players and circular franchise paths. Prevent accidental graph loops by tracking:

- Transaction fingerprint.
- Asset lineage ID.
- Branch ancestry.

If an already displayed transaction is discovered again,
link to or highlight the existing node rather than duplicating it unless the user explicitly chooses a duplicate presentation.

### 12.5 Connection status

Each suggestion has one of these statuses:

- `available`
- `loading`
- `added`
- `dismissed`
- `ambiguous`
- `provider-unavailable`
- `no-known-connection`

Dismissed suggestions can be restored from the inspector.

---

## 13. Domain Model

The persisted PuckTree document must remain independent from React Flow.

```ts
export type ConfidenceLevel=| "verified"
| "strong-match"
| "possible"
| "manual";

export type SourceReference= {
  id: string;
  provider: string;
  sourceName: string;
  sourceUrl: string | null;
  retrievedAt: string;
  recordFingerprint: string | null;
}

;

export type PlayerSnapshot= {
  playerId: string | null;
  fullName: string;
  position: string | null;
  sweaterNumber: number | null;
  headshotUrl: string | null;
  heroImageUrl: string | null;
  teamId: string | null;
  teamName: string | null;
}

;

export type TeamSnapshot= {
  teamId: string;
  franchiseId: string | null;
  fullName: string;
  abbreviation: string | null;
  logoUrl: string | null;
  historicalName: string | null;
}

;

export type PlayerAsset= {
  id: string;
  kind: "player";
  player: PlayerSnapshot;
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
  userEditedFields: string[];
  branchStatus: "open"| "complete"| "unknown";
}

;

export type DraftPickAsset= {
  id: string;
  kind: "draft-pick";
  draftYear: number | null;
  round: number | null;
  overall: number | null;
  originalTeamId: string | null;
  conditionsText: string | null;
  selectedPlayer: PlayerSnapshot | null;
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
  userEditedFields: string[];
  branchStatus: "open"| "complete"| "unknown";
}

;

export type CustomAsset= {
  id: string;
  kind: "custom";
  label: string;
  shortLabel: string | null;
  icon: "rights"| "cash"| "future"| "other";
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
  userEditedFields: string[];
  branchStatus: "open"| "complete"| "unknown";
}

;

export type TradeAsset=PlayerAsset | DraftPickAsset | CustomAsset;

export type TradeSide= {
  team: TeamSnapshot;
  receivesAssetIds: string[];
}

;

export type TradeEvent= {
  id: string;
  transactionDate: string;
  sides: TradeSide[];
  sourceRefs: SourceReference[];
  providerFingerprint: string | null;
  confidence: ConfidenceLevel;
  reviewReasons: string[];
  userEditedFields: string[];
}

;

export type AssetLineageLink= {
  id: string;
  fromAssetId: string;
  toTradeId: string;
  relationship: "later-traded"| "pick-used"| "rights-transferred"| "custom";
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
}

;

export type PuckTreeDocument= {
  schemaVersion: 1;
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  anchorPlayerId: string | null;
  rootTradeId: string;
  tradesById: Record<string, TradeEvent>;
  assetsById: Record<string, TradeAsset>;
  lineageLinksById: Record<string, AssetLineageLink>;
  dismissedSuggestionIds: string[];

  layoutOverrides: Record<string,
    {
    x: number;
    y: number
  }

  >;

  presentation: {
    aspectRatio: "free"| "16:9"| "1:1";
    background: "light"| "dark"| "transparent";
    showTitle: boolean;
    showSources: boolean;
    showWatermark: boolean;
  }

  ;
}

;
```

### Model rules

- React Flow node IDs may mirror domain IDs, but React Flow objects are derived and never persisted as the source of truth.
- A trade may have more than two sides in the domain even if the initial UI optimizes for two-team trades.
- User-edited fields are protected from provider refreshes.
- Every imported object must retain at least one source reference.
- Branch suggestions remain transient server state until accepted.
- A selected player drafted with a traded pick remains attached to the pick asset.

---

## 14. Visual Graph Model

Represent a trade as a transaction junction, not a direct player-to-player line.

```text
Assets relinquished by Team A ->Trade Event ->Assets received by Team A
Assets relinquished by Team B ->Trade Event ->Assets received by Team B
```

For readability, PuckTree can visually simplify the initial trade into two team lanes while maintaining the full domain relationship.

### Node types

- Player node.
- Draft-pick node.
- Transaction node.
- Custom-asset node.
- Team lane header.
- Collapsed branch summary.

### Edge types

- Asset included in trade.
- Team received asset.
- Asset later traded.
- Pick used to select player.
- Existing-node reference for cycle handling.

### Layout direction

Default to left-to-right chronological flow.

- Earlier transactions appear left.
- Later transactions appear right.
- Team lanes use stable vertical positioning within a local branch.
- Downstream branches expand to the right.
- Pick outcomes appear as compact nested nodes before continuing into later trades.

Use ELK for layered layout if it produces cleaner branching than Dagre. Allow manual drag overrides after layout.

---

## 15. Node and Card Design

### 15.1 Player node

Visual priority:

1. Player headshot.
2. Player name.
3. Team badge at the time of the transaction.
4. Position or short contextual metadata.
5. Branch indicator.

Requirements:

- Approximately 190 to 230 px wide on desktop.
- Large cropped headshot or circular avatar.
- Two-line maximum player name.
- No paragraph descriptions.
- Placeholder uses initials and a hockey-player silhouette.
- Selected state uses a clear outline and subtle elevation.
- Confidence status appears as a small icon, not a large badge.
- Source indicator appears on hover, focus, or selection.

### 15.2 Draft-pick node

Display:

- Draft year as the largest text.
- Round and overall selection when known.
- Original team badge when relevant.
- Conditional icon when conditions exist.
- Selected player photo when resolved.
- Branch indicator.

Avoid displaying full condition text on the node. Put it in the inspector.

### 15.3 Transaction node

Keep compact:

- Date.
- Team badges.
- Small trade icon.
- Confidence or review indicator.

Selecting it opens the full transaction summary and sources.

### 15.4 Team lane header

Display team logo, name, and a subtle lane label such as **Received by Toronto**. Team colours may be used as small accents only. The overall tree must remain readable when teams share similar colours.

### 15.5 Connection suggestions

The suggestion indicator should feel inviting without clutter:

- Small glowing dot or compact pill.
- Number of available branches.
- Tooltip: **Continue tracing this asset**.
- Loading state uses a restrained spinner.
- Ambiguous state uses a question-mark icon.

---

## 16. UX and Visual Design Requirements

### 16.1 Design principles

- Image-forward, not text-heavy.
- Hockey-specific without looking like an official league product.
- Direct manipulation where it improves understanding.
- Progressive disclosure for details and sources.
- One primary action per state.
- Fast perceived performance.
- Clear recovery when automation fails.
- Visual consistency across imported and manual data.
- Professional enough for use in a video or media workflow.

### 16.2 Desktop layout

- Slim top command bar.
- Large central canvas.
- Collapsible right inspector.
- Bottom-left zoom controls.
- Optional minimap hidden until the tree becomes large.

Top command bar:

- PuckTree logo.
- Editable title.
- Undo and redo.
- Auto layout.
- Fit to view.
- Presentation mode.
- Export button.
- Overflow menu.

### 16.3 Inspector

Inspector sections are contextual:

For player:

- Identity and image.
- Trade context.
- Available connections.
- Source and confidence.
- Manual edit controls.

For pick:

- Pick identity.
- Conditions.
- Selected player.
- Available connections.
- Sources.

For transaction:

- Date and teams.
- Assets by side.
- Review warnings.
- Sources.
- Edit transaction.

Avoid showing all fields at once. Use compact sections and disclosure controls.

### 16.4 Narrow screens

- Canvas remains primary.
- Inspector becomes a bottom sheet.
- Search and trade selection use full-screen sheets.
- Node cards reduce in width but retain imagery.
- Export is available but advanced export controls may be desktop-only.
- Pinch zoom and touch panning must work.

### 16.5 Motion

Use motion to explain changes:

- Animate generated nodes into position.
- Animate a newly added branch from its parent asset.
- Preserve viewport position when unrelated branches change.
- Respect `prefers-reduced-motion`.
- Avoid decorative looping animations.

---

## 17. State Architecture

Use Zustand with Immer for editor state and TanStack Query for server state.

### Persisted document state

- Trades.
- Assets.
- Lineage links.
- User edits.
- Dismissed suggestions.
- Layout overrides.
- Presentation settings.

### Transient editor state

- Selection.
- Hover state.
- Open inspector section.
- Viewport.
- Active export dialog.
- Command palette.
- Currently expanded suggestion tray.

### Server state

- Player search.
- Player details.
- Player trades.
- Trade details.
- Connection suggestions.
- Provider health.

### Undo and redo

Record user document commands:

- Add branch.
- Remove branch.
- Edit asset.
- Edit transaction.
- Move node.
- Apply layout.
- Dismiss or restore suggestion.

Do not record:

- Selection.
- Hover.
- Zoom.
- Data fetching.
- Opening dialogs.

Use domain commands rather than arbitrary object mutation.

---

## 18. Autocomplete and Imagery

### 18.1 Player autocomplete

Requirements:

- Debounced search.
- Request cancellation.
- Cached recent queries.
- Accent and punctuation normalization.
- Keyboard support.
- Loading skeletons that preserve menu size.
- Player photo fallbacks.
- Manual-entry fallback.
- Recent-search suggestions before typing.

### 18.2 Team autocomplete

Search by:

- Full team name.
- City.
- Abbreviation.
- Historical name.
- Franchise identity.

Show logo and active date range for historical teams.

### 18.3 Image handling

- Load remote images at runtime.
- Do not commit downloaded assets.
- Use an allowlist in Next.js image configuration.
- Handle broken images without layout shift.
- Cache image metadata but not necessarily image bytes.
- Use initials and icons when remote images fail.
- Exports must either embed permitted remote images at render time or use fallbacks when cross-origin restrictions prevent embedding.

---

## 19. Technical Architecture

### 19.1 Monorepo structure

```text
pucktree/
  apps/
    web/ # Next.js and React application
  services/
    transaction-provider/ # Python FastAPI provider and normalizer
  packages/
    domain/ # TypeScript domain types and commands
    ui/ # Shared React components and tokens
    graph/ # Domain-to-React-Flow selectors and layout
    eslint-config/
    tsconfig/
  data/
    fixtures/ # Sanitized provider fixtures for tests
    samples/ # Curated sample tree documents
  docs/
    architecture.md
    data-sources.md
    normalization.md
  docker-compose.yml
  PUCKTREE_PRODUCT_SPEC.md
```

### 19.2 Web stack

Use current stable releases of:

- Next.js App Router.
- React.
- TypeScript strict mode.
- pnpm workspaces.
- Tailwind CSS.
- Radix primitives or shadcn/ui.
- `@xyflow/react`.
- Zustand and Immer.
- TanStack Query.
- React Hook Form and Zod.
- ELK.js or Dagre for layout.
- `html-to-image`,
`modern-screenshot`,
or an equivalent export library validated with remote images. - Vitest and React Testing Library. - Playwright. ### 19.3 Python provider stack - Python 3.11 or newer. - FastAPI. - Pydantic. - `pro_sports_transactions`. - HTTPX or the package-supported request layer. - SQLAlchemy or SQLModel. - Alembic. - PostgreSQL for hosted cache,
SQLite permitted for local development. - Pytest. The provider's optional request-handler dependency must be configured by the operator according to the upstream project's documentation and applicable rules. Do not expose that implementation detail to the browser. ### 19.4 Browser/server boundary - The browser talks only to same-origin Next.js routes. - Next.js routes normalize errors and proxy internal provider requests. - The Python service owns provider calls and raw transaction parsing. - The web application consumes only stable normalized JSON. - Provider timeouts must not block the editor from opening cached or local trees. ### 19.5 Storage Hosted cache tables: - `players` - `teams` - `provider_records` - `normalized_transactions` - `transaction_assets` - `transaction_sides` - `player_transaction_index` - `asset_connection_index` - `provider_jobs` - `shared_trees`,
optional Local browser storage: - User-created tree documents. - Recent player searches. - Draft edits. - User preferences. Use IndexedDB through Dexie for tree documents. Use localStorage only for small preferences. --- ## 20. Provider Reliability and Caching ### 20.1 Cache-first behaviour - Cached data is returned immediately. - Freshness status is included in responses. - Stale data remains usable. - Refresh runs separately from the initial response when possible. - Duplicate refreshes are coalesced. ### 20.2 Rate limits - Rate limit refresh requests per IP and player. - Do not allow arbitrary provider queries from the client. - Normalize player names before cache lookup. - Cache negative results for a shorter period. Suggested defaults: - Successful player transaction result: 30 days. - No-result lookup: 24 hours. - Provider failure: 15 minutes. - NHL player search: 24 hours server-side plus client caching. ### 20.3 Provider job states - `queued` - `running` - `complete` - `partial` - `failed` - `disabled` The UI should translate these into plain language. ### 20.4 Partial results A provider lookup may return only some records. Return them with: - `isPartial: true` - Human-readable reason. - Retrieval timestamp. - Option to retry. - Manual-entry option. ### 20.5 Fixture mode The entire application must work in fixture mode without external providers. Fixture mode supports: - Local development. - Automated tests. - Public demonstrations during provider outages. - Deterministic sample trees. --- ## 21. Loading,
Error,
and Empty States ### Player search unavailable Show recent players and manual entry. Do not show a generic error page. ### Trade provider lookup in progress Use a visual progress state: - **Checking cached trade history** - **Finding transactions** - **Connecting players and teams** Do not claim specific work that the backend is not actually doing. ### No trades found Show: - **No trade history was found for this player.** - **Try another spelling**. - **Add a trade manually**. - Data-source limitations link. ### Provider unavailable Show cached data when available. Otherwise: - **Automatic lookup is temporarily unavailable. You can still build this tree manually.** ### Ambiguous trade Generate a review screen with side-by-side assets and unresolved identities before creating the tree. ### Image failure Use avatar fallback without toast or disruptive messaging. ### Export failure Explain which external image could not be embedded and offer export with image fallbacks. --- ## 22. Accessibility Requirements - WCAG 2.2 AA target for primary workflows. - All autocomplete controls use correct combobox semantics. - Every graph node is keyboard focusable. - Provide a non-canvas tree outline for screen-reader navigation. - Arrow-key or command-based node movement must be available. - Do not rely on team colour alone. - Provide visible focus rings. - Tooltips are supplementary,
not the only source of information. - Dialogs and sheets trap and restore focus correctly. - Announce branch additions and removals through an ARIA live region. - Respect reduced motion. - Exported graphics should include optional alt-text generation based on the tree structure. This is deterministic text,
not AI. --- ## 23. Performance Requirements - Keep the initial landing bundle small by loading the graph editor only when needed. - Virtualize long player and trade result lists. - Abort stale autocomplete requests. - Memoize graph conversion selectors. - Run expensive layout in a Web Worker when trees exceed a defined threshold. - Avoid rerendering all nodes when one selection changes. - Lazy-load high-resolution images. - Prefer thumbnails on nodes and high-resolution images only for export. - Support at least 150 visible nodes at interactive frame rates on a typical laptop. - Preserve usable interaction while connection suggestions load. --- ## 24. Privacy and Security - No account required for core usage. - Local trees remain in the browser unless the user explicitly shares one. - Shared trees contain only the tree document and display snapshots. - Do not expose provider cookies,
configuration,
raw HTML,
or internal errors. - Validate all provider data and imported JSON. - Sanitize user-entered labels. - Limit JSON and share payload size. - Use server-side request allowlists. - Never accept an arbitrary URL for the provider service to fetch. - Do not include secrets or provider credentials in client bundles. - Add dependency scanning and secret scanning in CI. --- ## 25. Testing Strategy ### 25.1 Unit tests - Name normalization. - Team alias resolution. - Provider-row grouping. - Transaction classification. - Player identity scoring. - Draft-pick parsing. - Event fingerprinting. - Cycle prevention. - Domain commands. - Document migrations. - Graph selectors. - Export sizing calculations. ### 25.2 Provider contract tests Use saved,
sanitized fixtures rather than live external requests in CI. Test: - Successful movement records. - Multiple rows forming one trade. - Players with punctuation and accents. - Historical team names. - No-result response. - Source-format changes. - Partial pages. - Provider timeout. - Duplicate records. A fixture-schema test should fail clearly when captured provider output no longer maps to expected fields. ### 25.3 React component tests - Player autocomplete keyboard flow. - Trade picker. - Player node fallbacks. - Connection suggestion states. - Source drawer. - Ambiguity review. - Inspector edits. - Undo and redo. - Export dialog. ### 25.4 End-to-end tests 1. Search for a fixture player,
select a trade,
and generate a tree. 2. Expand a player branch and confirm the new transaction appears. 3. Dismiss and restore a suggestion. 4. Correct an unresolved player identity. 5. Reload and confirm local persistence. 6. Export a 16:9 image. 7. Open a shared sample in read-only mode and make a local copy. 8. Simulate provider failure and confirm cached data remains usable. 9. Complete the core workflow using only a keyboard. ### 25.5 Visual regression tests Capture: - Landing page. - Search results. - Trade picker. - Small tree. - Large tree. - Ambiguous state. - Presentation mode. - 16:9 export preview. - Image fallbacks. --- ## 26. Observability For the public demo,
capture operational health without collecting sensitive user content. Metrics: - Provider lookup success and failure counts. - Cache hit rate. - Normalization failure count. - Median lookup duration. - Ambiguous identity count. - Export failure count. Logs: - Use structured logs. - Redact provider configuration and cookies. - Do not log full user-created tree documents by default. - Include correlation IDs between Next.js and Python service requests. Provide a health page or endpoint that indicates: - Web healthy. - Provider service healthy. - Transaction provider enabled or disabled. - Last successful catalog refresh. - Cache available. --- ## 27. Deployment ### Local development Use Docker Compose for: - Next.js web app. - Python transaction provider. - PostgreSQL. - Optional operator-configured request-handler service. Provide fixture mode so contributors can run the product without external access. ### Public showcase Deploy to a host that supports long-running Node and Python services plus persistent storage. Do not assume serverless functions are suitable for provider requests that may take several seconds. Public showcase requirements: - HTTPS. - Same-origin web API. - Persistent cache. - Prewarmed sample data. - Provider timeout and circuit breaker. - Daily database backup. - Error monitoring. - A visible build version. - A one-command rollback path. ### Graceful degradation If the Python service is unavailable: - Landing and samples still load. - Existing local trees still open. - Cached trade data remains available if exposed through the web cache. - Manual tree creation still works. - The application clearly labels automatic lookup as temporarily unavailable. --- ## 28. Sample Content Requirements Ship at least three polished sample trees: 1. A recognizable Toronto Maple Leafs trade with at least one downstream branch. 2. A famous league-wide trade with a draft-pick outcome. 3. A compact example that teaches the interface in under 30 seconds. Each sample must be manually verified against at least one linked source before inclusion. Sample cards show: - Anchor player photo. - Team badges. - Number of transactions. - Number of assets. - Approximate timespan. - **Explore tree** action. Do not make Wayne Gretzky the only headline example. Include a modern and locally relevant example. --- ## 29. MVP Milestones ### Milestone 0: Provider spike Purpose: prove the data source before building the full UI. Deliverables: - Python service scaffold. - `pro_sports_transactions` provider adapter. - Operator-configured request handler abstraction. - Captured sanitized NHL fixtures. - Search by exact player name. - Normalized transaction candidate output. - Notes documenting raw fields and known parsing problems. - Automated provider fixture tests. Exit criteria: - At least five notable players return usable transaction records. - At least three multi-asset trades normalize correctly. - Provider failures are bounded by timeout. - No provider configuration reaches the browser. ### Milestone 1: Magic-path prototype Deliverables: - Landing player search. - Photo-backed autocomplete. - Trade picker. - One-click generated trade tree. - Custom player,
pick,
transaction,
and team nodes. - Cached fixture data for at least five anchor trades. - Basic source drawer. Exit criteria: - A first-time user can generate a sample-quality tree with no manual data entry. ### Milestone 2: Branch discovery Deliverables: - Player connection algorithm. - Connection indicators. - Suggestion tray. - Add,
dismiss,
and edit-before-adding actions. - Partial branch layout. - Cycle prevention. - Draft-pick placeholders. Exit criteria: - At least ten tested anchor trades expose one reliable expandable branch. ### Milestone 3: Correction-grade editor Deliverables: - Contextual inspector. - Manual asset and branch creation. - Identity resolution review. - Protected user edits. - Undo and redo. - Local persistence and migrations. - JSON import and export. Exit criteria: - A user can repair an incomplete or incorrectly parsed trade without leaving the app. ### Milestone 4: Share and presentation Deliverables: - Presentation mode. - 16:9,
landscape,
square,
and viewport exports. - Share links or published sample pages. - Source footer option. - High-resolution image handling. - Read-only shared view. Exit criteria: - A creator can use an exported tree in a video or social post without redesigning it elsewhere. ### Milestone 5: Public-demo hardening Deliverables: - Prewarmed catalog. - Cache and provider job states. - Rate limiting. - Circuit breaker. - Health endpoint. - Error monitoring. - Accessibility pass. - Cross-browser E2E suite. - README,
architecture notes,
screenshots,
and demo video. Exit criteria: - The demo remains useful during a provider outage and is credible to share directly with a hockey media professional. --- ## 30. Definition of Done PuckTree MVP is done when: - The core search-to-tree workflow is intuitive without instructions. - Automatic discovery works for a meaningful prewarmed catalog. - Uncached lookups fail gracefully. - The user can confirm or reject suggested connections. - Imported facts show source provenance. - Manual corrections are retained. - Player photos and team identity make the tree visually scannable. - The editor is not dominated by forms or text. - The tree exports cleanly at 1920 x 1080. - Sample trees are verified and visually polished. - Tests cover parsing,
graph behaviour,
failures,
persistence,
and the main user journey. - The app works in fixture mode. - The project documents data limitations honestly. - No third-party datasets or downloaded image assets are committed without permission. - The repository can be installed and run by another developer using documented commands. --- ## 31. Portfolio and Sharing Positioning Suggested project description:>Hockey trade trees are surprisingly difficult to research and create. Following one deal can mean searching years of transactions,
resolving draft picks,
and manually redrawing a graphic every time another branch appears. I built PuckTree,
an open-source React application that finds a player's trades, generates the initial tree, and suggests the next connections to explore. Users can verify sources, correct ambiguous data, and export a polished visual for articles, social posts, or videos.

Key engineering themes to highlight:

- React and TypeScript architecture.
- Async autocomplete and server-state handling.
- Interactive graph exploration.
- Provider abstraction and data normalization.
- Confidence and provenance UX.
- Local-first editing.
- Progressive enhancement and graceful degradation.
- Accessibility.
- High-resolution export.
- Testable product scope.

---

## Copilot Build Prompt

Copy the prompt below into GitHub Copilot Chat from the root of a new repository. Save this product specification as `PUCKTREE_PRODUCT_SPEC.md` first.

```text
You are my senior engineering partner for PuckTree,
an open-source React application that automatically discovers and visualizes NHL trade trees. Read `PUCKTREE_PRODUCT_SPEC.md` completely before proposing architecture or writing code. Treat it as the source of truth. Do not silently expand scope. When requirements conflict,
prioritize the magic path,
data provenance,
graceful failure,
and a polished user experience suitable for sharing with a professional hockey creator. PRODUCT OUTCOME A user searches for an NHL player,
selects one of the player's trades, and receives a generated visual trade tree. Player photos, team badges, dates, and graph structure should communicate most of the information. Assets with later trade history expose one-click connection suggestions. The user can add, dismiss, verify, or correct those branches and export a presentation-quality image.

This is not a generic diagram editor,
a salary-cap tool,
a transaction database business,
or an AI product. It is a focused hockey workflow with React as the main product surface. REQUIRED STACK Web monorepo: - pnpm workspaces - Next.js App Router - React - TypeScript with strict mode and no unchecked indexed access - Tailwind CSS - Radix primitives or shadcn/ui - @xyflow/react - Zustand with Immer - TanStack Query - React Hook Form and Zod - ELK.js or Dagre - Dexie for local documents - Vitest and React Testing Library - Playwright Provider service: - Python 3.11+- FastAPI - Pydantic - pro_sports_transactions - SQLAlchemy or SQLModel - Alembic - PostgreSQL in hosted environments,
SQLite allowed for local fixture development - Pytest ARCHITECTURAL RULES 1. Keep PuckTree domain models independent from React Flow nodes and edges. 2. Persist the domain document and derive canvas nodes and edges through selectors. 3. Use Zustand for editor and document state. Use TanStack Query for remote server state. 4. Keep player identity,
transaction discovery,
and source normalization behind stable server adapters. 5. The browser must never consume raw Pro Sports Transactions rows or upstream NHL response shapes. 6. Use the NHL web endpoints only through server-side adapters for player search,
identity,
team information,
headshots,
and logos. 7. Use `pro_sports_transactions` through a Python `TransactionProvider` interface. Include fixture and disabled providers. 8. The package's operator-configured request handler must remain server-side. Never expose cookies, configuration, provider URLs, or raw HTML to the browser.
9. Do not make every user request depend on a live external lookup. Implement cache-first responses and a fixture mode. 10. Store source references,
retrieval timestamps,
provider fingerprints,
confidence,
and user-edited fields. 11. Never overwrite a user-edited field during refresh. 12. Ambiguous player identities and draft-pick connections must be presented for confirmation. 13. Keep manual entry available whenever automatic discovery fails. 14. Use accessible comboboxes,
dialogs,
sheets,
graph nodes,
keyboard controls,
and focus management from the start. 15. Do not package NHL player images,
team logos,
or raw third-party datasets in the repository. 16. Do not add authentication,
payments,
AI,
collaborative editing,
cap calculations,
betting,
or multi-league support. 17. Do not suppress TypeScript,
lint,
schema,
or test errors to move forward. 18. Add vertical-slice tests as features are implemented. DATA AND LEGAL POSITION The `pro_sports_transactions` package is open-source,
but its own documentation states that the underlying Pro Sports Transactions information remains subject to rights reserved by that source. A disclaimer does not create a data licence. Build the provider as replaceable,
include attribution and accuracy limitations,
and keep external provider use operator-configured. Do not commit raw source data,
downloaded images,
cookies,
or credentials. The end-user experience should still be excellent. Use a prewarmed verified catalog,
durable normalized caching,
and fixture data so the public demo remains useful during provider outages. USER EXPERIENCE RULES 1. The landing page is centred around one large player search field. 2. Search results show headshots,
names,
positions,
and team badges. 3. Selecting a player immediately opens a visual trade picker. 4. Selecting a trade generates the initial tree automatically. 5. The graph is chronological from left to right. 6. Player photos and team identity are more prominent than metadata. 7. Avoid large forms,
tables,
paragraphs,
dashboard cards,
and permanent sidebars. 8. Use progressive disclosure for sources,
confidence,
conditions,
and manual corrections. 9. Every branch suggestion has Add,
Review,
Dismiss,
and Edit before adding paths. 10. Imported information must reveal its source on demand. 11. Provider or image failures must not destroy the current workflow. 12. Export must support a clean 1920 x 1080 presentation preset. 13. Presentation mode hides editing chrome and can highlight one lineage path. 14. Motion should explain branch creation and layout changes,
not decorate the page. 15. Respect reduced motion and provide a keyboard-navigable tree outline. FIRST TASK: MILESTONE 0 PROVIDER SPIKE Do not scaffold the entire product first. Prove the data source and normalized contract. Implement: 1. A pnpm monorepo skeleton containing `apps/web`,
`services/transaction-provider`,
`packages/domain`,
`packages/graph`,
and `data/fixtures`. 2. A minimal FastAPI service with `/health` and an internal player transaction search endpoint. 3. A Python `TransactionProvider` protocol with fixture,
disabled,
and Pro Sports Transactions implementations. 4. Environment-based provider selection. Default automated tests to fixture mode. 5. Strict Pydantic models for raw captured provider records and normalized transaction candidates. 6. A provider timeout,
structured error types,
and no raw upstream exception leakage. 7. A script or protected internal endpoint that captures sanitized representative fixtures without committing cookies,
request details,
or unrelated source content. 8. Normalization for transaction date,
source reference,
raw fingerprint,
movement classification,
team tokens,
player tokens,
and review reasons. 9. Initial grouping logic that never groups transactions based only on date. 10. Pytest coverage for successful records,
no records,
duplicate rows,
multiple rows forming one event,
punctuation in player names,
timeout,
and malformed source data. 11. A small Next.js diagnostics page available only in development that calls the same-origin server route and renders normalized candidates. Keep it visual but simple. This page is for validating the contract,
not the final UX. 12. Documentation in `docs/normalization.md` listing the actual captured provider fields,
assumptions,
unresolved cases,
and fixture provenance. Before writing code: 1. Summarize the architecture for this milestone. 2. List every file you intend to create or modify. 3. Identify packages and explain why each is required. 4. State any assumptions about the current `pro_sports_transactions` package based on its installed API or documentation. 5. Do not invent package methods. Inspect the installed package,
type information,
or official project examples first. After each coherent implementation step: 1. Run Python formatting,
linting,
type checking where configured,
and relevant tests. 2. Run TypeScript type checking and tests for affected packages. 3. Fix failures instead of bypassing them. 4. Summarize the completed change and remaining milestone work. 5. Stop after Milestone 0 passes its exit criteria. Do not continue into the full graph editor until I ask. MILESTONE 0 EXIT CRITERIA - Five notable NHL players return usable fixture-backed transaction candidates. - Three multi-asset trades normalize into grouped candidates. - Provider timeouts are bounded and readable. - The browser sees only stable normalized JSON. - Tests do not require external network access. - Raw provider fields and parsing limitations are documented. - No secrets,
cookies,
raw HTML,
downloaded headshots,
or team logos are committed.

```
