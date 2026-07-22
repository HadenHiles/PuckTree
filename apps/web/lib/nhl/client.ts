/**
 * NHL API client
 * 
 * Adapter for NHL's public web API endpoints.
 * All responses are normalized to stable PuckTree types.
 */

import type {
  NHLPlayerSearchResult,
  NHLPlayerProfile,
  NHLTeam,
  PlayerSearchCandidate,
  PlayerIdentity,
  TeamIdentity,
} from './types';

const NHL_API_BASE = 'https://api-web.nhle.com/v1';
const NHL_SEARCH_BASE = 'https://search.d3.nhle.com/api/v1/search/player';

/**
 * Search for NHL players by name
 * 
 * Results are filtered and ranked by:
 * - Name match quality (exact > starts with > contains)
 * - Active status (active players first)
 * - Recent play (players with recent seasons)
 */
export async function searchPlayers(
  query: string,
  options: { limit?: number; signal?: AbortSignal } = {}
): Promise<PlayerSearchCandidate[]> {
  const { limit = 8, signal } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Request more results than needed to allow for filtering
    const params = new URLSearchParams({
      culture: 'en-us',
      limit: String(Math.min(limit * 3, 50)),
      q: query.trim(),
    });

    const response = await fetch(`${NHL_SEARCH_BASE}?${params}`, {
      signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('NHL player search failed:', response.status);
      return [];
    }

    const results: NHLPlayerSearchResult[] = await response.json();

    // Normalize and filter results
    const candidates = results
      .map(normalizeSearchResult)
      .filter(filterRelevantPlayers(query))
      .sort(rankSearchResults(query))
      .slice(0, limit);

    return candidates;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    console.error('NHL player search error:', error);
    return [];
  }
}

/**
 * Get detailed player profile by ID
 */
export async function getPlayerProfile(
  playerId: string,
  options: { signal?: AbortSignal } = {}
): Promise<PlayerIdentity | null> {
  try {
    const response = await fetch(
      `${NHL_API_BASE}/player/${playerId}/landing`,
      {
        signal: options.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('NHL player profile fetch failed:', response.status);
      return null;
    }

    const profile: NHLPlayerProfile = await response.json();
    return normalizePlayerProfile(profile);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    console.error('NHL player profile error:', error);
    return null;
  }
}

/**
 * Get team information by ID
 */
export async function getTeam(
  teamId: string,
  options: { signal?: AbortSignal } = {}
): Promise<TeamIdentity | null> {
  try {
    // Note: NHL API doesn't have a single team endpoint in the public API
    // We'll need to get this from the stats API or franchise endpoint
    const response = await fetch(
      `https://api.nhle.com/stats/rest/en/team/${teamId}`,
      {
        signal: options.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('NHL team fetch failed:', response.status);
      return null;
    }

    const team: NHLTeam = await response.json();
    return normalizeTeam(team);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    console.error('NHL team fetch error:', error);
    return null;
  }
}

/**
 * Normalize search result to domain type
 */
function normalizeSearchResult(
  result: NHLPlayerSearchResult
): PlayerSearchCandidate {
  const teamId = result.teamId ?? result.lastTeamId ?? null;
  const teamAbbrev = result.teamAbbrev ?? result.lastTeamAbbrev ?? null;

  return {
    playerId: String(result.playerId),
    fullName: result.name,
    position: normalizePosition(result.positionCode),
    teamId: teamId ? String(teamId) : null,
    teamName: null, // Populated from team lookup if needed
    teamAbbrev,
    headshotUrl: result.headshotUrl ?? buildHeadshotUrl(result.playerId),
    sweaterNumber: result.sweaterNumber ?? null,
    careerYears: result.lastSeasonId ? formatSeasonYear(result.lastSeasonId) : null,
    isActive: result.active ?? false,
    gamesPlayed: null, // Not available from search API
  };
}

/**
 * Normalize player profile to domain type
 */
function normalizePlayerProfile(profile: NHLPlayerProfile): PlayerIdentity {
  const fullName = `${profile.firstName.default} ${profile.lastName.default}`;

  return {
    playerId: String(profile.playerId),
    firstName: profile.firstName.default,
    lastName: profile.lastName.default,
    fullName,
    position: profile.position,
    sweaterNumber: profile.sweaterNumber ?? null,
    headshotUrl: profile.headshot ?? buildHeadshotUrl(profile.playerId),
    heroImageUrl: profile.heroImage ?? null,
    teamId: profile.currentTeamId ? String(profile.currentTeamId) : null,
    teamName: null, // Would need separate team lookup
    teamAbbrev: profile.currentTeamAbbrev ?? null,
    birthDate: profile.birthDate ?? null,
    birthCity: profile.birthCity?.default ?? null,
    birthCountry: profile.birthCountry ?? null,
    heightInInches: profile.heightInInches ?? null,
    weightInPounds: profile.weightInPounds ?? null,
    shootsCatches: profile.shootsCatches ?? null,
    draftDetails: profile.draftDetails
      ? {
          year: profile.draftDetails.year,
          teamAbbrev: profile.draftDetails.teamAbbrev,
          round: profile.draftDetails.round,
          pickInRound: profile.draftDetails.pickInRound,
          overallPick: profile.draftDetails.overallPick,
        }
      : null,
    careerStats: profile.careerTotals?.regularSeason
      ? {
          gamesPlayed: profile.careerTotals.regularSeason.gamesPlayed,
          goals: profile.careerTotals.regularSeason.goals,
          assists: profile.careerTotals.regularSeason.assists,
          points: profile.careerTotals.regularSeason.points,
        }
      : null,
  };
}

/**
 * Normalize team to domain type
 */
function normalizeTeam(team: NHLTeam): TeamIdentity {
  return {
    teamId: String(team.id),
    franchiseId: team.franchiseId ? String(team.franchiseId) : null,
    fullName: team.fullName,
    commonName: team.commonName.default,
    abbreviation: team.triCode,
    logoUrl: team.logo ?? null,
    darkLogoUrl: team.darkLogo ?? null,
    primaryColor: team.primaryColor ?? null,
    secondaryColor: team.secondaryColor ?? null,
  };
}

/**
 * Build headshot URL from player ID
 * NHL uses a predictable pattern for player headshots
 */
function buildHeadshotUrl(playerId: number): string {
  return `https://assets.nhle.com/mugs/nhl/20232024/${playerId}.png`;
}

/**
 * Normalize position code to readable position
 */
function normalizePosition(code: string): string {
  const positions: Record<string, string> = {
    'C': 'Center',
    'L': 'Left Wing',
    'R': 'Right Wing',
    'D': 'Defense',
    'G': 'Goalie',
  };
  return positions[code] ?? code;
}

/**
 * Format season ID to year range
 * Example: 20232024 -> "2023-24"
 */
function formatSeasonYear(seasonId: number): string {
  const str = String(seasonId);
  if (str.length === 8) {
    const startYear = str.substring(0, 4);
    const endYear = str.substring(6, 8);
    return `${startYear}-${endYear}`;
  }
  return str;
}

/**
 * Filter function to remove non-relevant players from search results
 * Prioritizes active players and those with recent NHL experience
 */
function filterRelevantPlayers(query: string): (player: PlayerSearchCandidate) => boolean {
  const normalizedQuery = query.toLowerCase().trim();
  
  return (player: PlayerSearchCandidate) => {
    const normalizedName = player.fullName.toLowerCase();
    
    // Always include if name contains the query
    if (!normalizedName.includes(normalizedQuery)) {
      return false;
    }
    
    // Include all active players
    if (player.isActive) {
      return true;
    }
    
    // Include inactive players with recent career years (within last 5 years)
    if (player.careerYears) {
      const yearMatch = player.careerYears.match(/(\d{4})/);
      if (yearMatch) {
        const lastYear = parseInt(yearMatch[1]);
        const currentYear = new Date().getFullYear();
        if (currentYear - lastYear <= 5) {
          return true;
        }
      }
    }
    
    // Exclude very old/obscure players
    return false;
  };
}

/**
 * Ranking function to sort search results by relevance
 * Priority: exact match > starts with > contains, then active > inactive, then recent play
 */
function rankSearchResults(query: string): (a: PlayerSearchCandidate, b: PlayerSearchCandidate) => number {
  const normalizedQuery = query.toLowerCase().trim();
  
  return (a: PlayerSearchCandidate, b: PlayerSearchCandidate) => {
    const nameA = a.fullName.toLowerCase();
    const nameB = b.fullName.toLowerCase();
    
    // 1. Exact match wins
    const exactA = nameA === normalizedQuery ? 1 : 0;
    const exactB = nameB === normalizedQuery ? 1 : 0;
    if (exactA !== exactB) return exactB - exactA;
    
    // 2. Starts with query wins
    const startsA = nameA.startsWith(normalizedQuery) ? 1 : 0;
    const startsB = nameB.startsWith(normalizedQuery) ? 1 : 0;
    if (startsA !== startsB) return startsB - startsA;
    
    // 3. Active players win
    const activeA = a.isActive ? 1 : 0;
    const activeB = b.isActive ? 1 : 0;
    if (activeA !== activeB) return activeB - activeA;
    
    // 4. More recent career years win
    const yearA = extractLastYear(a.careerYears);
    const yearB = extractLastYear(b.careerYears);
    if (yearA !== yearB) return yearB - yearA;
    
    // 5. Fall back to alphabetical
    return nameA.localeCompare(nameB);
  };
}

/**
 * Extract the last year from career years string
 */
function extractLastYear(careerYears: string | null): number {
  if (!careerYears) return 0;
  const match = careerYears.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}
