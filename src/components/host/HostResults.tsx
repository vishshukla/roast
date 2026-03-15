"use client";
import type { GameState } from "@/lib/types";
import { getPlayerName } from "@/lib/utils";
import ScoreBoard from "@/components/ui/ScoreBoard";

interface HostResultsProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
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
          <p className="mt-3 text-orange-500 font-bold text-lg">
            {votesForA} vote{votesForA !== 1 ? "s" : ""}
          </p>
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
          <p className="mt-3 text-orange-500 font-bold text-lg">
            {votesForB} vote{votesForB !== 1 ? "s" : ""}
          </p>
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
