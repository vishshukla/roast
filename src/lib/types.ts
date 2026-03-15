// === Player ===
export interface Player {
  id: string;           // PartyKit connection ID
  name: string;         // Display name (max 16 chars)
  color: string;        // Assigned hex color
  score: number;        // Cumulative score
  isHost: boolean;      // Is this the room creator?
  connected: boolean;   // WebSocket connected?
}

// === Room State (server-authoritative) ===
export type GamePhase =
  | "lobby"
  | "round_start"
  | "debate"
  | "voting"
  | "results"
  | "game_over";

export interface RoundData {
  roundNumber: number;          // 1-indexed
  prompt: string;               // AI-generated hot take
  debaterA: string;             // Player ID
  debaterB: string;             // Player ID
  isAIAssistedRound: boolean;   // Does one debater get an AI argument?
  aiAssistedPlayer: string | null; // Which debater gets AI help (A or B ID)
  aiArgument: string | null;    // The AI-generated argument text
  argumentA: string | null;     // What debater A submitted
  argumentB: string | null;     // What debater B submitted
  votes: Record<string, string>; // voterId -> voted-for playerId
  aiGuesses: Record<string, string>; // voterId -> who they think was AI-assisted
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Record<string, Player>;
  currentRound: RoundData | null;
  roundHistory: RoundData[];
  totalRounds: number;
  config: GameConfig;
}

export interface GameConfig {
  maxPlayers: number;
  totalRounds: number;
  debateTimeSec: number;
  voteTimeSec: number;
  resultsTimeSec: number;
  aiAssistedRoundChance: number; // 0-1, probability a round has AI assistance
}

// === WebSocket Messages ===

// Client -> Server
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start_game" }
  | { type: "submit_argument"; text: string }
  | { type: "submit_vote"; votedFor: string }
  | { type: "submit_ai_guess"; guessedPlayer: string }
  | { type: "play_again" };

// Server -> Client (broadcast)
export type ServerMessage =
  | { type: "state_update"; state: GameState }
  | { type: "player_role"; role: PlayerRole }   // Sent only to individual
  | { type: "error"; message: string };

// Player's role for the current round
export interface PlayerRole {
  isDebater: boolean;
  side: "A" | "B" | null;       // null if spectator
  aiArgument: string | null;     // Non-null only if this player is AI-assisted
  isAIAssistedRound: boolean;
}
