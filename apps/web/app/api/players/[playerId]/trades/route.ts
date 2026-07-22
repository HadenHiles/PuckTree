/**
 * Player trades API route
 * GET /api/players/[playerId]/trades
 * 
 * Returns cached normalized trades for a player from the transaction provider.
 * Optionally triggers a background refresh if data is stale.
 */

import { NextRequest, NextResponse } from 'next/server';

const TRANSACTION_PROVIDER_URL = process.env.TRANSACTION_PROVIDER_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  if (!playerId) {
    return NextResponse.json(
      { error: 'Player ID is required' },
      { status: 400 }
    );
  }

  // For now, we'll proxy to the transaction provider
  // In a full implementation, this would check a cache layer first
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('playerName');

    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name is required for transaction search' },
        { status: 400 }
      );
    }

    // Call the transaction provider service
    const providerUrl = new URL('/internal/transactions/search', TRANSACTION_PROVIDER_URL);
    providerUrl.searchParams.set('player_name', playerName);

    const response = await fetch(providerUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 15 second timeout for provider lookup
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('Transaction provider error:', response.status);
      return NextResponse.json(
        {
          trades: [],
          cached: false,
          error: 'Transaction provider temporarily unavailable',
        },
        { status: 200 } // Still return 200 with empty array for graceful degradation
      );
    }

    const data = await response.json();

    // Transform snake_case to camelCase for domain types
    const transactions = (data.transactions || []).map((txn: any) => ({
      ...txn,
      transactionDate: txn.transaction_date,
      reviewReasons: txn.review_reasons || [],
      teams: (txn.teams || []).map((team: any) => ({
        teamId: team.team_id,
        teamName: team.team_name,
        abbreviation: team.abbreviation,
      })),
      source: {
        id: txn.source.id,
        provider: txn.source.provider,
        sourceName: txn.source.source_name,
        sourceUrl: txn.source.source_url,
        retrievedAt: txn.source.retrieved_at,
      },
      assets: (txn.assets || []).map((asset: any) => ({
        id: asset.id,
        kind: asset.kind,
        displayLabel: asset.display_label,
        playerRef: asset.player_ref ? {
          playerName: asset.player_ref.player_name,
          normalizedName: asset.player_ref.normalized_name,
          nhlPlayerId: asset.player_ref.nhl_player_id,
          position: asset.player_ref.position,
          confidence: asset.player_ref.confidence,
        } : null,
        draftYear: asset.draft_year,
        round: asset.round,
        overall: asset.overall,
        conditionsText: asset.conditions_text,
        confidence: asset.confidence,
      })),
    }));

    return NextResponse.json({
      trades: transactions,
      rawCount: data.transactions?.length || 0,
      provider: data.provider_status || 'unknown',
      cached: false,
      retrievedAt: data.retrieved_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Player trades error:', error);
    
    // Return empty trades with graceful error message
    return NextResponse.json(
      {
        trades: [],
        cached: false,
        error: 'Unable to fetch trade history. You can still build manually.',
      },
      { status: 200 }
    );
  }
}

/**
 * Trigger a background refresh of player trades
 * POST /api/players/[playerId]/trades/refresh
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId: _playerId } = await params;

  // Rate limiting would go here
  // For now, return not implemented
  return NextResponse.json(
    { error: 'Refresh not yet implemented' },
    { status: 501 }
  );
}
