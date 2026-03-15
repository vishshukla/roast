import { describe, it, expect } from "vitest";
import { generateRoomCode, getPlayerName, sortByScore } from "@/lib/utils";

describe("generateRoomCode", () => {
  it("returns a 4-character string", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
  });

  it("only contains uppercase letters (no I or O)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    }
  });

  it("generates different codes (not always the same)", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateRoomCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("getPlayerName", () => {
  it("returns player name when found", () => {
    const players = { abc: { name: "Alice" }, def: { name: "Bob" } };
    expect(getPlayerName(players, "abc")).toBe("Alice");
  });

  it("returns 'Unknown' when not found", () => {
    const players = { abc: { name: "Alice" } };
    expect(getPlayerName(players, "xyz")).toBe("Unknown");
  });
});

describe("sortByScore", () => {
  it("sorts players by score descending", () => {
    const players = {
      a: { id: "a", name: "Alice", score: 100, color: "#f00" },
      b: { id: "b", name: "Bob", score: 300, color: "#0f0" },
      c: { id: "c", name: "Charlie", score: 200, color: "#00f" },
    };
    const sorted = sortByScore(players);
    expect(sorted[0].name).toBe("Bob");
    expect(sorted[1].name).toBe("Charlie");
    expect(sorted[2].name).toBe("Alice");
  });

  it("returns empty array for empty input", () => {
    expect(sortByScore({})).toEqual([]);
  });
});
