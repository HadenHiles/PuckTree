/**
 * Player search API route
 * GET /api/players/search?q=player+name
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchPlayers } from '@/lib/nhl/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limitParam = searchParams.get('limit');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const limit = limitParam ? parseInt(limitParam, 10) : 8;
    
    const results = await searchPlayers(query, {
      limit: Math.min(limit, 20), // Cap at 20 results
    });

    return NextResponse.json({
      players: results,
      query,
    });
  } catch (error) {
    console.error('Player search error:', error);
    return NextResponse.json(
      { error: 'Failed to search players' },
      { status: 500 }
    );
  }
}
