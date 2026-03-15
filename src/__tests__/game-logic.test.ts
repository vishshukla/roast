import { describe, it, expect } from "vitest";
import type { GameState, RoundData, Player } from "@/lib/types";

// Test the scoring logic that lives in the server
// We replicate it here to unit test without needing the full PartyKit runtime

function calculateScores(
  players: Record<string, Player>,
  round: RoundData
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const p of Object.values(players)) {
    scores[p.id] = p.score;
  }

  const votesForA = Object.values(round.votes).filter(
    (v) => v === round.debaterA
  ).length;
  const votesForB = Object.values(round.votes).filter(
    (v) => v === round.debaterB
  ).length;

  // Debaters get points per vote
  scores[round.debaterA] = (scores[round.debaterA] || 0) + votesForA * 100;
  scores[round.debaterB] = (scores[round.debaterB] || 0) + votesForB * 100;

  // Majority bonus (ties award all voters)
  const isTie = votesForA === votesForB;
  const majorityChoice =
    votesForA > votesForB ? round.debaterA : round.debaterB;
  for (const [voterId, votedFor] of Object.entries(round.votes)) {
    if (isTie || votedFor === majorityChoice) {
      scores[voterId] = (scores[voterId] || 0) + 50;
    }
  }

  // AI guess bonus
  if (round.isAIAssistedRound && round.aiAssistedPlayer) {
    for (const [guesserId, guess] of Object.entries(round.aiGuesses)) {
      if (guess === round.aiAssistedPlayer) {
        scores[guesserId] = (scores[guesserId] || 0) + 150;
      }
    }
  }

  return scores;
}

function sanitizeState(state: GameState): GameState {
  const copy = JSON.parse(JSON.stringify(state)) as GameState;
  if (copy.currentRound && copy.phase !== "results" && copy.phase !== "game_over") {
    copy.currentRound.aiAssistedPlayer = null;
    copy.currentRound.aiArgument = null;
    copy.currentRound.aiGuesses = {};
    if (copy.phase === "debate") {
      if (copy.currentRound.argumentA) {
        copy.currentRound.argumentA = "__submitted__";
      }
      if (copy.currentRound.argumentB) {
        copy.currentRound.argumentB = "__submitted__";
      }
    }
  }
  return copy;
}

function makePlayer(id: string, name: string, score = 0): Player {
  return { id, name, color: "#f00", score, isHost: false, connected: true };
}

function makeRound(overrides: Partial<RoundData> = {}): RoundData {
  return {
    roundNumber: 1,
    prompt: "Test prompt",
    debaterA: "p1",
    debaterB: "p2",
    isAIAssistedRound: false,
    aiAssistedPlayer: null,
    aiArgument: null,
    argumentA: null,
    argumentB: null,
    votes: {},
    aiGuesses: {},
    ...overrides,
  };
}

describe("scoring logic", () => {
  it("awards 100 points per vote to debaters", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
      p4: makePlayer("p4", "Dave"),
    };
    const round = makeRound({
      votes: { p3: "p1", p4: "p1" }, // both vote for p1
    });

    const scores = calculateScores(players, round);
    expect(scores.p1).toBe(200); // 2 votes * 100
    expect(scores.p2).toBe(0);   // 0 votes
  });

  it("awards 50 points for voting with majority", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
      p4: makePlayer("p4", "Dave"),
      p5: makePlayer("p5", "Eve"),
    };
    const round = makeRound({
      votes: { p3: "p1", p4: "p1", p5: "p2" },
    });

    const scores = calculateScores(players, round);
    expect(scores.p3).toBe(50); // voted with majority
    expect(scores.p4).toBe(50); // voted with majority
    expect(scores.p5).toBe(0);  // voted against majority
  });

  it("awards 50 points to ALL voters on a tie", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
      p4: makePlayer("p4", "Dave"),
    };
    const round = makeRound({
      votes: { p3: "p1", p4: "p2" }, // 1-1 tie
    });

    const scores = calculateScores(players, round);
    expect(scores.p3).toBe(50); // tie = everyone gets majority bonus
    expect(scores.p4).toBe(50); // tie = everyone gets majority bonus
  });

  it("awards 150 points for correct AI guess", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
    };
    const round = makeRound({
      isAIAssistedRound: true,
      aiAssistedPlayer: "p1",
      votes: { p3: "p1" },
      aiGuesses: { p3: "p1" }, // correct guess
    });

    const scores = calculateScores(players, round);
    expect(scores.p3).toBe(50 + 150); // majority + AI guess bonus
  });

  it("no AI bonus for wrong guess", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
    };
    const round = makeRound({
      isAIAssistedRound: true,
      aiAssistedPlayer: "p1",
      votes: { p3: "p1" },
      aiGuesses: { p3: "p2" }, // wrong guess
    });

    const scores = calculateScores(players, round);
    expect(scores.p3).toBe(50); // only majority bonus, no AI bonus
  });

  it("no AI bonus when round is not AI-assisted", () => {
    const players = {
      p1: makePlayer("p1", "Alice"),
      p2: makePlayer("p2", "Bob"),
      p3: makePlayer("p3", "Charlie"),
    };
    const round = makeRound({
      isAIAssistedRound: false,
      aiAssistedPlayer: null,
      votes: { p3: "p1" },
      aiGuesses: { p3: "p1" },
    });

    const scores = calculateScores(players, round);
    expect(scores.p3).toBe(50); // only majority, no AI bonus
  });

  it("accumulates with existing scores", () => {
    const players = {
      p1: makePlayer("p1", "Alice", 500),
      p2: makePlayer("p2", "Bob", 300),
      p3: makePlayer("p3", "Charlie", 100),
    };
    const round = makeRound({
      votes: { p3: "p1" },
    });

    const scores = calculateScores(players, round);
    expect(scores.p1).toBe(600); // 500 + 100
    expect(scores.p3).toBe(150); // 100 + 50
  });
});

describe("state sanitization", () => {
  it("hides AI info during debate phase", () => {
    const state: GameState = {
      roomId: "TEST",
      phase: "debate",
      players: {},
      currentRound: makeRound({
        isAIAssistedRound: true,
        aiAssistedPlayer: "p1",
        aiArgument: "secret argument",
        argumentA: "real argument A",
        argumentB: null,
      }),
      roundHistory: [],
      totalRounds: 5,
      config: {
        maxPlayers: 8,
        totalRounds: 5,
        debateTimeSec: 60,
        voteTimeSec: 20,
        resultsTimeSec: 8,
        aiAssistedRoundChance: 0.4,
      },
    };

    const sanitized = sanitizeState(state);
    expect(sanitized.currentRound!.aiAssistedPlayer).toBeNull();
    expect(sanitized.currentRound!.aiArgument).toBeNull();
    expect(sanitized.currentRound!.aiGuesses).toEqual({});
    expect(sanitized.currentRound!.argumentA).toBe("__submitted__");
    expect(sanitized.currentRound!.argumentB).toBeNull(); // not submitted yet
  });

  it("hides AI info during voting phase", () => {
    const state: GameState = {
      roomId: "TEST",
      phase: "voting",
      players: {},
      currentRound: makeRound({
        isAIAssistedRound: true,
        aiAssistedPlayer: "p1",
        aiArgument: "secret",
        argumentA: "argument A",
        argumentB: "argument B",
        aiGuesses: { p3: "p1" },
      }),
      roundHistory: [],
      totalRounds: 5,
      config: {
        maxPlayers: 8,
        totalRounds: 5,
        debateTimeSec: 60,
        voteTimeSec: 20,
        resultsTimeSec: 8,
        aiAssistedRoundChance: 0.4,
      },
    };

    const sanitized = sanitizeState(state);
    expect(sanitized.currentRound!.aiAssistedPlayer).toBeNull();
    expect(sanitized.currentRound!.aiArgument).toBeNull();
    // Arguments are NOT hidden during voting (players need to read them)
    expect(sanitized.currentRound!.argumentA).toBe("argument A");
    expect(sanitized.currentRound!.argumentB).toBe("argument B");
  });

  it("reveals AI info during results phase", () => {
    const state: GameState = {
      roomId: "TEST",
      phase: "results",
      players: {},
      currentRound: makeRound({
        isAIAssistedRound: true,
        aiAssistedPlayer: "p1",
        aiArgument: "AI wrote this",
        argumentA: "argument A",
        argumentB: "argument B",
      }),
      roundHistory: [],
      totalRounds: 5,
      config: {
        maxPlayers: 8,
        totalRounds: 5,
        debateTimeSec: 60,
        voteTimeSec: 20,
        resultsTimeSec: 8,
        aiAssistedRoundChance: 0.4,
      },
    };

    const sanitized = sanitizeState(state);
    expect(sanitized.currentRound!.aiAssistedPlayer).toBe("p1");
    expect(sanitized.currentRound!.aiArgument).toBe("AI wrote this");
  });

  it("does not mutate original state", () => {
    const state: GameState = {
      roomId: "TEST",
      phase: "debate",
      players: {},
      currentRound: makeRound({
        aiAssistedPlayer: "p1",
        aiArgument: "secret",
      }),
      roundHistory: [],
      totalRounds: 5,
      config: {
        maxPlayers: 8,
        totalRounds: 5,
        debateTimeSec: 60,
        voteTimeSec: 20,
        resultsTimeSec: 8,
        aiAssistedRoundChance: 0.4,
      },
    };

    sanitizeState(state);
    expect(state.currentRound!.aiAssistedPlayer).toBe("p1");
    expect(state.currentRound!.aiArgument).toBe("secret");
  });
});
