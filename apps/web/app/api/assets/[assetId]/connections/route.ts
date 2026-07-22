/**
 * Asset connections API route
 * GET /api/assets/[assetId]/connections
 * 
 * Returns suggested later transactions involving this asset (player or draft pick).
 * Used for branch discovery in the tree editor.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  if (!assetId) {
    return NextResponse.json(
      { error: 'Asset ID is required' },
      { status: 400 }
    );
  }

  // For now, return empty connections
  // This will be expanded to query the transaction provider for later trades
  // involving the player from this asset
  
  return NextResponse.json({
    assetId,
    connections: [],
    retrievedAt: new Date().toISOString(),
  });
}
