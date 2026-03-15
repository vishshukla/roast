import type { GameConfig } from "./types";

export const GAME_CONFIG: GameConfig = {
  maxPlayers: 8,
  totalRounds: 5,
  debateTimeSec: 60,
  voteTimeSec: 20,
  resultsTimeSec: 8,
  aiAssistedRoundChance: 0.4, // 40% of rounds have AI assistance
};

export const PLAYER_COLORS = [
  "#EF4444", // red
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export const MIN_PLAYERS = 3;
export const MAX_NAME_LENGTH = 16;
