/**
 * Fetch connection suggestions for a given asset
 * 
 * Extracted from store to avoid async issues with Zustand immer middleware.
 */

import type { ConnectionSuggestion } from './tree-store';
import type { NormalizedTransactionCandidate } from '@pucktree/domain';

export async function fetchConnectionsForAsset(
  assetId: string,
  playerName: string,
  existingTradeIds: string[]
): Promise<ConnectionSuggestion[]> {
  try {
    // Query the transaction provider for later trades involving this player
    const response = await fetch(
      `/api/players/search?q=${encodeURIComponent(playerName)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search for player connections');
    }

    const searchData = await response.json();
    const player = searchData.players?.[0];

    if (!player) {
      return [];
    }

    // Fetch trades for this player
    const tradesResponse = await fetch(
      `/api/players/${player.playerId}/trades?playerName=${encodeURIComponent(playerName)}`
    );

    if (!tradesResponse.ok) {
      throw new Error('Failed to fetch trades');
    }

    const tradesData = await tradesResponse.json();
    const trades = tradesData.trades || [];

    // Convert trades to connection suggestions
    // Filter out trades already in the tree
    const connections: ConnectionSuggestion[] = trades
      .filter((trade: NormalizedTransactionCandidate) => 
        !existingTradeIds.includes(trade.id)
      )
      .map((trade: NormalizedTransactionCandidate) => ({
        id: `conn-${assetId}-${trade.id}`,
        assetId,
        transactionId: trade.id,
        transactionDate: trade.transactionDate,
        kind: trade.kind,
        teams: trade.teams,
        assets: trade.assets,
        confidence: trade.confidence,
        source: trade.source,
        dismissed: false,
      }));

    return connections;
  } catch (error) {
    console.error('Failed to fetch connections:', error);
    return [];
  }
}
