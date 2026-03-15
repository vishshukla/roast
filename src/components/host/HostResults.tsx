"use client";
import type { GameState, PlayerRole } from "@/lib/types";
import { getPlayerName } from "@/lib/utils";
import ScoreBoard from "@/components/ui/ScoreBoard";

interface HostResultsProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

/** Calculate points each player earned this round from the round data. */
function calcRoundPoints(state: GameState): Record<string, number> {
  const round = state.currentRound;
  if (!round) return {};

  const pts: Record<string, number> = {};

  const votesForA = Object.values(round.votes).filter(
    (v) => v === round.debaterA
  ).length;
  const votesForB = Object.values(round.votes).filter(
    (v) => v === round.debaterB
  ).length;

  // Debater points: 100 per vote received
  if (votesForA > 0) pts[round.debaterA] = votesForA * 100;
  if (votesForB > 0) pts[round.debaterB] = votesForB * 100;

  // Voter points: 50 for voting with majority (or tie)
  const isTie = votesForA === votesForB;
  const majorityChoice = votesForA > votesForB ? round.debaterA : round.debaterB;
  for (const [voterId, votedFor] of Object.entries(round.votes)) {
    if (isTie || votedFor === majorityChoice) {
      pts[voterId] = (pts[voterId] ?? 0) + 50;
    }
  }

  // AI guess points: 150 for correct guess
  if (round.isAIAssistedRound && round.aiAssistedPlayer) {
    for (const [guesserId, guess] of Object.entries(round.aiGuesses)) {
      if (guess === round.aiAssistedPlayer) {
        pts[guesserId] = (pts[guesserId] ?? 0) + 150;
      }
    }
  }

  return pts;
}

export default function HostResults({ state }: HostResultsProps) {
  const round = state.currentRound;
  if (!round) return null;

  const votesForA = Object.values(round.votes).filter(
    (v) => v === round.debaterA
  ).length;
  const votesForB = Object.values(round.votes).filter(
    (v) => v === round.debaterB
  ).length;

  const roundPoints = calcRoundPoints(state);
  const pointsA = roundPoints[round.debaterA] ?? 0;
  const pointsB = roundPoints[round.debaterB] ?? 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">
          Round {round.roundNumber} Results
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: state.players[round.debaterA]?.color,
              }}
            />
            <span className="font-bold">
              {getPlayerName(state.players, round.debaterA)}
            </span>
            <span className="text-green-400 text-sm uppercase ml-1">FOR</span>
            {round.aiAssistedPlayer === round.debaterA && (
              <span className="ml-1" title="AI-assisted">&#129302;</span>
            )}
          </div>
          <p className="text-neutral-300 leading-relaxed">{round.argumentA}</p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-orange-500 font-bold text-lg">
              {votesForA} vote{votesForA !== 1 ? "s" : ""}
            </p>
            {pointsA > 0 && (
              <span className="text-green-400 font-bold text-lg animate-score-pop">
                +{pointsA}
              </span>
            )}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: state.players[round.debaterB]?.color,
              }}
            />
            <span className="font-bold">
              {getPlayerName(state.players, round.debaterB)}
            </span>
            <span className="text-red-400 text-sm uppercase ml-1">AGAINST</span>
            {round.aiAssistedPlayer === round.debaterB && (
              <span className="ml-1" title="AI-assisted">&#129302;</span>
            )}
          </div>
          <p className="text-neutral-300 leading-relaxed">{round.argumentB}</p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-orange-500 font-bold text-lg">
              {votesForB} vote{votesForB !== 1 ? "s" : ""}
            </p>
            {pointsB > 0 && (
              <span className="text-green-400 font-bold text-lg animate-score-pop">
                +{pointsB}
              </span>
            )}
          </div>
        </div>
      </div>

      {round.isAIAssistedRound && round.aiAssistedPlayer && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
          <p className="text-amber-400 font-bold">
            &#129302; {getPlayerName(state.players, round.aiAssistedPlayer)} had AI assistance!
          </p>
        </div>
      )}

      <div className="w-full max-w-md">
        <h3 className="text-neutral-400 text-sm uppercase tracking-wider text-center mb-3">
          Scoreboard
        </h3>
        <ScoreBoard players={state.players} />
      </div>
    </div>
  );
}
