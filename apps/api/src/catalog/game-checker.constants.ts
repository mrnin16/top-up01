// RapidAPI "ID Game Checker" — validates a game account (userId + zoneId)
// and returns the in-game username. Used by /products/:slug/validate-account
// so the frontend can display the username for the user to confirm ownership.
//
// Endpoint shape:  GET {BASE_URL}/{game}/{userId}/{zoneId}
// Sample response: { success: true, data: { game, userId, username } }

export const RAPIDAPI_BASE_URL = 'https://id-game-checker.p.rapidapi.com';
export const RAPIDAPI_HOST     = 'id-game-checker.p.rapidapi.com';
export const RAPIDAPI_KEY      = '5ed50c7679msh9e9755ac7c62b7cp1fc58fjsn1cf1d33ca5ac';

// Maps our internal product slug → the path segment expected by the
// RapidAPI ID Game Checker. Add new entries here as more games are wired up.
export const GAME_CHECKER_SLUG_MAP: Record<string, string> = {
  mlbb: 'mobile-legends',
};
