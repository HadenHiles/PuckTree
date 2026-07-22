/**
 * Shared domain types for PuckTree
 * 
 * These types represent the normalized transaction data contract
 * between the Python provider service and the Next.js web application.
 */

export type ConfidenceLevel = "verified" | "strong-match" | "possible" | "manual";

export type TransactionKind = "trade" | "waiver" | "signing" | "draft" | "other";

export interface SourceReference {
  id: string;
  provider: string;
  sourceName: string;
  sourceUrl: string | null;
  retrievedAt: string;
  recordFingerprint: string | null;
}

export interface NormalizedTeamRef {
  teamId: string;
  teamName: string;
  abbreviation: string | null;
}

export interface NormalizedPlayerRef {
  playerName: string;
  normalizedName: string;
  nhlPlayerId: string | null;
  position: string | null;
  confidence: ConfidenceLevel;
}

export interface NormalizedAssetCandidate {
  id: string;
  kind: "player" | "draft-pick" | "custom";
  displayLabel: string;
  playerRef: NormalizedPlayerRef | null;
  draftYear: number | null;
  round: number | null;
  overall: number | null;
  conditionsText: string | null;
  confidence: ConfidenceLevel;
}

export interface NormalizedTransactionCandidate {
  id: string;
  transactionDate: string;
  kind: TransactionKind;
  teams: NormalizedTeamRef[];
  assets: NormalizedAssetCandidate[];
  source: SourceReference;
  confidence: ConfidenceLevel;
  reviewReasons: string[];
}

export interface TransactionSearchResponse {
  query: string;
  transactions: NormalizedTransactionCandidate[];
  isPartial: boolean;
  providerStatus: "success" | "partial" | "failed" | "disabled";
  providerMessage: string | null;
  retrievedAt: string;
}
