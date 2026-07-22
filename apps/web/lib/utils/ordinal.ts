/**
 * Convert a number to its ordinal form (1st, 2nd, 3rd, 4th, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}

/**
 * Build NHL headshot URL from player ID
 * NHL uses a predictable pattern for player headshots
 */
export function buildHeadshotUrl(playerId: string | number): string {
  return `https://assets.nhle.com/mugs/nhl/20232024/${playerId}.png`;
}
