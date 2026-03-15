import type { Party, PartyKitServer, Connection } from "partykit/server";
import { GAME_CONFIG, PLAYER_COLORS, MIN_PLAYERS } from "../lib/constants";
import type {
  GameState, Player, RoundData,
  ClientMessage, ServerMessage, PlayerRole
} from "../lib/types";

export default class RoastRoom implements PartyKitServer {
  state: GameState;
  timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(public room: Party) {
    this.state = this.initialState();
  }

  initialState(): GameState {
    return {
      roomId: this.room.id,
      phase: "lobby",
      players: {},
      currentRound: null,
      roundHistory: [],
      totalRounds: GAME_CONFIG.totalRounds,
      config: GAME_CONFIG,
    };
  }

  // --- Connection lifecycle ---

  onConnect(conn: Connection) {
    this.send(conn, { type: "state_update", state: this.sanitizeState() });
  }

  onClose(conn: Connection) {
    if (this.state.players[conn.id]) {
      this.state.players[conn.id].connected = false;
      this.broadcast({ type: "state_update", state: this.sanitizeState() });
    }
  }

  onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Connection) {
    if (typeof message !== "string") return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    switch (msg.type) {
      case "join":
        this.handleJoin(sender, msg.name);
        break;
      case "start_game":
        this.handleStartGame(sender);
        break;
      case "submit_argument":
        this.handleSubmitArgument(sender, msg.text);
        break;
      case "submit_vote":
        this.handleSubmitVote(sender, msg.votedFor);
        break;
      case "submit_ai_guess":
        this.handleSubmitAIGuess(sender, msg.guessedPlayer);
        break;
      case "play_again":
        this.handlePlayAgain(sender);
        break;
    }
  }

  // --- Message handlers ---

  handleJoin(conn: Connection, name: string) {
    if (this.state.phase !== "lobby") {
      this.send(conn, { type: "error", message: "Game already in progress" });
      return;
    }

    const playerCount = Object.keys(this.state.players).length;
    if (playerCount >= GAME_CONFIG.maxPlayers) {
      this.send(conn, { type: "error", message: "Room is full" });
      return;
    }

    const trimmedName = name.trim().slice(0, 16);
    if (!trimmedName) {
      this.send(conn, { type: "error", message: "Name required" });
      return;
    }

    this.state.players[conn.id] = {
      id: conn.id,
      name: trimmedName,
      color: PLAYER_COLORS[playerCount % PLAYER_COLORS.length],
      score: 0,
      isHost: playerCount === 0,
      connected: true,
    };

    this.broadcast({ type: "state_update", state: this.sanitizeState() });
  }

  handleStartGame(conn: Connection) {
    const player = this.state.players[conn.id];
    if (!player?.isHost) return;

    const connectedPlayers = this.getConnectedPlayers();
    if (connectedPlayers.length < MIN_PLAYERS) {
      this.send(conn, {
        type: "error",
        message: `Need at least ${MIN_PLAYERS} players`,
      });
      return;
    }

    this.state.roundHistory = [];
    for (const p of Object.values(this.state.players)) {
      p.score = 0;
    }
    this.startRound(1);
  }

  async startRound(roundNumber: number) {
    this.state.phase = "round_start";

    const players = this.getConnectedPlayers();
    const shuffled = this.shuffle([...players]);
    const debaterA = shuffled[0];
    const debaterB = shuffled[1];

    const isAIAssisted =
      Math.random() < this.state.config.aiAssistedRoundChance;
    const aiAssistedPlayer = isAIAssisted
      ? (Math.random() < 0.5 ? debaterA.id : debaterB.id)
      : null;

    const prompt = await this.generatePrompt();

    let aiArgument: string | null = null;
    if (isAIAssisted) {
      const side = aiAssistedPlayer === debaterA.id ? "FOR" : "AGAINST";
      aiArgument = await this.generateArgument(prompt, side);
    }

    this.state.currentRound = {
      roundNumber,
      prompt,
      debaterA: debaterA.id,
      debaterB: debaterB.id,
      isAIAssistedRound: isAIAssisted,
      aiAssistedPlayer,
      aiArgument,
      argumentA: null,
      argumentB: null,
      votes: {},
      aiGuesses: {},
    };

    this.broadcast({ type: "state_update", state: this.sanitizeState() });

    for (const p of players) {
      const role = this.getPlayerRole(p.id);
      this.sendToPlayer(p.id, { type: "player_role", role });
    }

    this.setTimer("round_start", 2000, () => {
      this.state.phase = "debate";
      this.broadcast({ type: "state_update", state: this.sanitizeState() });

      this.setTimer("debate", this.state.config.debateTimeSec * 1000, () => {
        this.endDebate();
      });
    });
  }

  handleSubmitArgument(conn: Connection, text: string) {
    if (this.state.phase !== "debate" || !this.state.currentRound) return;

    const round = this.state.currentRound;
    const trimmed = text.trim().slice(0, 500);

    if (conn.id === round.debaterA) {
      round.argumentA = trimmed;
    } else if (conn.id === round.debaterB) {
      round.argumentB = trimmed;
    } else {
      return;
    }

    this.broadcast({ type: "state_update", state: this.sanitizeState() });

    if (round.argumentA && round.argumentB) {
      this.clearTimer("debate");
      this.endDebate();
    }
  }

  endDebate() {
    if (this.state.phase !== "debate" || !this.state.currentRound) return;

    const round = this.state.currentRound;

    if (!round.argumentA) round.argumentA = "(No argument submitted)";
    if (!round.argumentB) round.argumentB = "(No argument submitted)";

    this.state.phase = "voting";
    this.broadcast({ type: "state_update", state: this.sanitizeState() });

    this.setTimer("voting", this.state.config.voteTimeSec * 1000, () => {
      this.endVoting();
    });
  }

  handleSubmitVote(conn: Connection, votedFor: string) {
    if (this.state.phase !== "voting" || !this.state.currentRound) return;

    const round = this.state.currentRound;

    if (conn.id === round.debaterA || conn.id === round.debaterB) return;
    if (votedFor !== round.debaterA && votedFor !== round.debaterB) return;

    round.votes[conn.id] = votedFor;

    this.broadcast({ type: "state_update", state: this.sanitizeState() });

    const eligibleVoters = this.getConnectedPlayers().filter(
      (p) => p.id !== round.debaterA && p.id !== round.debaterB
    );
    const allVoted = eligibleVoters.every((p) => round.votes[p.id]);

    if (allVoted) {
      this.clearTimer("voting");
      this.endVoting();
    }
  }

  handleSubmitAIGuess(conn: Connection, guessedPlayer: string) {
    if (this.state.phase !== "voting" || !this.state.currentRound) return;
    const round = this.state.currentRound;
    // Debaters can't guess
    if (conn.id === round.debaterA || conn.id === round.debaterB) return;
    // Must guess a valid debater
    if (guessedPlayer !== round.debaterA && guessedPlayer !== round.debaterB) return;
    round.aiGuesses[conn.id] = guessedPlayer;
  }

  endVoting() {
    if (this.state.phase !== "voting" || !this.state.currentRound) return;

    const round = this.state.currentRound;

    const votesForA = Object.values(round.votes).filter(
      (v) => v === round.debaterA
    ).length;
    const votesForB = Object.values(round.votes).filter(
      (v) => v === round.debaterB
    ).length;

    if (this.state.players[round.debaterA]) {
      this.state.players[round.debaterA].score += votesForA * 100;
    }
    if (this.state.players[round.debaterB]) {
      this.state.players[round.debaterB].score += votesForB * 100;
    }

    const isTie = votesForA === votesForB;
    const majorityChoice = votesForA > votesForB ? round.debaterA : round.debaterB;
    for (const [voterId, votedFor] of Object.entries(round.votes)) {
      if (isTie || votedFor === majorityChoice) {
        if (this.state.players[voterId]) {
          this.state.players[voterId].score += 50;
        }
      }
    }

    if (round.isAIAssistedRound && round.aiAssistedPlayer) {
      for (const [guesserId, guess] of Object.entries(round.aiGuesses)) {
        if (guess === round.aiAssistedPlayer && this.state.players[guesserId]) {
          this.state.players[guesserId].score += 150;
        }
      }
    }

    this.state.roundHistory.push({ ...round });

    this.state.phase = "results";
    this.broadcast({ type: "state_update", state: this.sanitizeState() });

    this.setTimer("results", this.state.config.resultsTimeSec * 1000, () => {
      if (round.roundNumber >= this.state.totalRounds) {
        this.state.phase = "game_over";
        this.state.currentRound = null;
        this.broadcast({ type: "state_update", state: this.sanitizeState() });
      } else {
        this.startRound(round.roundNumber + 1);
      }
    });
  }

  handlePlayAgain(conn: Connection) {
    const player = this.state.players[conn.id];
    if (!player?.isHost) return;
    if (this.state.phase !== "game_over") return;

    this.clearTimer("round_start");
    this.clearTimer("debate");
    this.clearTimer("voting");
    this.clearTimer("results");

    this.state.phase = "lobby";
    this.state.currentRound = null;
    this.state.roundHistory = [];
    // Remove disconnected players, reset connected players' scores
    for (const [id, p] of Object.entries(this.state.players)) {
      if (!p.connected) {
        delete this.state.players[id];
      } else {
        p.score = 0;
      }
    }
    this.broadcast({ type: "state_update", state: this.sanitizeState() });
  }

  // --- AI Generation ---

  async generatePrompt(): Promise<string> {
    try {
      const res = await fetch(
        `${this.getApiBaseUrl()}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "prompt" }),
        }
      );
      const data = await res.json();
      return data.text || "Pineapple belongs on pizza.";
    } catch {
      const fallbacks = [
        "Cereal is a soup.",
        "Hot dogs are sandwiches.",
        "The best superpower is invisibility, not flight.",
        "Cats are better than dogs.",
        "Morning people are more productive than night owls.",
        "Social media has done more good than harm.",
        "AI will create more jobs than it destroys.",
        "The movie is always worse than the book.",
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  async generateArgument(prompt: string, side: string): Promise<string> {
    try {
      const res = await fetch(
        `${this.getApiBaseUrl()}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "argument", prompt, side }),
        }
      );
      const data = await res.json();
      return data.text || "I strongly believe this is correct because reasons.";
    } catch {
      return "I think the evidence clearly supports this position, and anyone who disagrees simply hasn't considered all the facts.";
    }
  }

  getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  // --- Helpers ---

  getConnectedPlayers(): Player[] {
    return Object.values(this.state.players).filter((p) => p.connected);
  }

  getPlayerRole(playerId: string): PlayerRole {
    const round = this.state.currentRound;
    if (!round) {
      return { isDebater: false, side: null, aiArgument: null, isAIAssistedRound: false };
    }

    const isDebater =
      playerId === round.debaterA || playerId === round.debaterB;
    const side =
      playerId === round.debaterA
        ? "A"
        : playerId === round.debaterB
        ? "B"
        : null;

    const aiArgument =
      playerId === round.aiAssistedPlayer ? round.aiArgument : null;

    return {
      isDebater,
      side,
      aiArgument,
      isAIAssistedRound: round.isAIAssistedRound,
    };
  }

  sanitizeState(): GameState {
    const state = JSON.parse(JSON.stringify(this.state)) as GameState;

    if (state.currentRound && state.phase !== "results" && state.phase !== "game_over") {
      state.currentRound.aiAssistedPlayer = null;
      state.currentRound.aiArgument = null;
      state.currentRound.aiGuesses = {};
      state.currentRound.isAIAssistedRound = false;
      if (state.phase === "debate") {
        if (state.currentRound.argumentA) {
          state.currentRound.argumentA = "__submitted__";
        }
        if (state.currentRound.argumentB) {
          state.currentRound.argumentB = "__submitted__";
        }
      }
    }

    return state;
  }

  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  setTimer(name: string, ms: number, callback: () => void) {
    this.clearTimer(name);
    this.timers.set(name, setTimeout(callback, ms));
  }

  clearTimer(name: string) {
    const timer = this.timers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(name);
    }
  }

  send(conn: Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  sendToPlayer(playerId: string, msg: ServerMessage) {
    const conn = [...this.room.getConnections()].find((c) => c.id === playerId);
    if (conn) conn.send(JSON.stringify(msg));
  }

  broadcast(msg: ServerMessage) {
    const data = JSON.stringify(msg);
    for (const conn of this.room.getConnections()) {
      conn.send(data);
    }
  }
}
