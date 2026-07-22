/**
 * NHL API response types
 * 
 * These types model the NHL's public web API responses.
 * All downstream code should use normalized domain types, not these raw shapes.
 */

export interface NHLPlayerSearchResult {
  playerId: number;
  name: string;
  positionCode: string;
  teamId?: number;
  teamAbbrev?: string;
  lastTeamId?: number;
  lastTeamAbbrev?: string;
  lastSeasonId?: number;
  headshotUrl?: string;
  sweaterNumber?: number;
}

export interface NHLPlayerProfile {
  playerId: number;
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  sweaterNumber?: number;
  position: string;
  headshot?: string;
  heroImage?: string;
  currentTeamId?: number;
  currentTeamAbbrev?: string;
  birthDate?: string;
  birthCity?: {
    default: string;
  };
  birthCountry?: string;
  heightInInches?: number;
  weightInPounds?: number;
  shootsCatches?: string;
  draftDetails?: {
    year: number;
    teamAbbrev: string;
    round: number;
    pickInRound: number;
    overallPick: number;
  };
  careerTotals?: {
    regularSeason?: {
      gamesPlayed: number;
      goals: number;
      assists: number;
      points: number;
    };
  };
}

export interface NHLTeam {
  id: number;
  franchiseId?: number;
  fullName: string;
  commonName: {
    default: string;
  };
  triCode: string;
  logo?: string;
  darkLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface NHLDraftPick {
  year: number;
  round: number;
  pickInRound: number;
  overallPick: number;
  teamAbbrev: string;
  playerId?: number;
  playerName?: string;
}

/**
 * Normalized types for PuckTree domain
 */

export interface PlayerSearchCandidate {
  playerId: string;
  fullName: string;
  position: string;
  teamId: string | null;
  teamName: string | null;
  teamAbbrev: string | null;
  headshotUrl: string | null;
  sweaterNumber: number | null;
  careerYears: string | null;
}

export interface PlayerIdentity {
  playerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  sweaterNumber: number | null;
  headshotUrl: string | null;
  heroImageUrl: string | null;
  teamId: string | null;
  teamName: string | null;
  teamAbbrev: string | null;
  birthDate: string | null;
  birthCity: string | null;
  birthCountry: string | null;
  heightInInches: number | null;
  weightInPounds: number | null;
  shootsCatches: string | null;
  draftDetails: {
    year: number;
    teamAbbrev: string;
    round: number;
    pickInRound: number;
    overallPick: number;
  } | null;
  careerStats: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
  } | null;
}

export interface TeamIdentity {
  teamId: string;
  franchiseId: string | null;
  fullName: string;
  commonName: string;
  abbreviation: string;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}
