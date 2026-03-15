"use client";
import type { GameState } from "@/lib/types";
import Timer from "@/components/ui/Timer";

interface HostVotingProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
}

export default function HostVoting({ state }: HostVotingProps) {
  const round = state.currentRound;
  if (!round) return null;

  const totalVotes = Object.keys(round.votes).length;
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
        <p className="text-neutral-400">Vote for the best argument!</p>
      </div>

      {round.isAIAssistedRound && (
        <p className="text-amber-400 text-sm">
          &#129302; One of these arguments had AI help...
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3">
            Argument A &mdash; FOR
          </p>
          <p className="text-lg leading-relaxed">{round.argumentA}</p>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold tabular-nums text-orange-500">
              {votesForA}
            </span>
            <span className="text-neutral-500 text-sm ml-1">votes</span>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">
            Argument B &mdash; AGAINST
          </p>
          <p className="text-lg leading-relaxed">{round.argumentB}</p>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold tabular-nums text-orange-500">
              {votesForB}
            </span>
            <span className="text-neutral-500 text-sm ml-1">votes</span>
          </div>
        </div>
      </div>

      <Timer durationSec={state.config.voteTimeSec} />

      <p className="text-neutral-500 text-sm">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast
      </p>
    </div>
  );
}
