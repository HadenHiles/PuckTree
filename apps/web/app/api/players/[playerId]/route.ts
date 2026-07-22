/**
 * Player profile API route
 * GET /api/players/[playerId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlayerProfile } from '@/lib/nhl/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  if (!playerId) {
    return NextResponse.json(
      { error: 'Player ID is required' },
      { status: 400 }
    );
  }

  try {
    const player = await getPlayerProfile(playerId);

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('Player profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}
