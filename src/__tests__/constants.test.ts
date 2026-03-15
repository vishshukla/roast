import { describe, it, expect } from "vitest";
import { GAME_CONFIG, PLAYER_COLORS, MIN_PLAYERS, MAX_NAME_LENGTH } from "@/lib/constants";

describe("GAME_CONFIG", () => {
  it("has correct default values", () => {
    expect(GAME_CONFIG.maxPlayers).toBe(8);
    expect(GAME_CONFIG.totalRounds).toBe(5);
    expect(GAME_CONFIG.debateTimeSec).toBe(60);
    expect(GAME_CONFIG.voteTimeSec).toBe(20);
    expect(GAME_CONFIG.resultsTimeSec).toBe(8);
    expect(GAME_CONFIG.aiAssistedRoundChance).toBe(0.4);
  });

  it("aiAssistedRoundChance is between 0 and 1", () => {
    expect(GAME_CONFIG.aiAssistedRoundChance).toBeGreaterThanOrEqual(0);
    expect(GAME_CONFIG.aiAssistedRoundChance).toBeLessThanOrEqual(1);
  });
});

describe("PLAYER_COLORS", () => {
  it("has 8 colors for max players", () => {
    expect(PLAYER_COLORS).toHaveLength(8);
  });

  it("all colors are valid hex strings", () => {
    for (const color of PLAYER_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("all colors are unique", () => {
    expect(new Set(PLAYER_COLORS).size).toBe(PLAYER_COLORS.length);
  });
});

describe("constants", () => {
  it("MIN_PLAYERS is 3", () => {
    expect(MIN_PLAYERS).toBe(3);
  });

  it("MAX_NAME_LENGTH is 16", () => {
    expect(MAX_NAME_LENGTH).toBe(16);
  });
});
