"use client";
import { useState } from "react";
import type { GameState, PlayerRole } from "@/lib/types";
import Timer from "@/components/ui/Timer";

interface PlayerVotingProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function PlayerVoting({ state, send, playerId, role }: PlayerVotingProps) {
  const round = state.currentRound;
  const [voted, setVoted] = useState(false);
  const [guessed, setGuessed] = useState(false);

  if (!round) return null;

  const isDebater =
    playerId === round.debaterA || playerId === round.debaterB;
  const isAIRound = role?.isAIAssistedRound ?? false;

  const handleVote = (votedFor: string) => {
    send({ type: "submit_vote", votedFor });
    setVoted(true);
  };

  const handleAIGuess = (guessedPlayer: string) => {
    send({ type: "submit_ai_guess", guessedPlayer });
    setGuessed(true);
  };

  if (isDebater) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
        <h1 className="text-2xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">
          Voting in progress... You&apos;re a debater this round.
        </p>
        <Timer durationSec={state.config.voteTimeSec} />
      </div>
    );
  }

  if (voted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
        <h1 className="text-2xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-green-400 text-xl font-bold">Vote submitted &#10003;</p>

        {isAIRound && !guessed && (
          <div className="w-full">
            <p className="text-amber-400 text-sm text-center mb-3">
              &#129302; Which debater had AI help?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAIGuess(round.debaterA)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold
                           py-4 rounded-2xl text-lg transition-colors"
              >
                A
              </button>
              <button
                onClick={() => handleAIGuess(round.debaterB)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold
                           py-4 rounded-2xl text-lg transition-colors"
              >
                B
              </button>
            </div>
          </div>
        )}

        {guessed && (
          <p className="text-amber-400 text-sm">AI guess submitted &#10003;</p>
        )}

        <p className="text-neutral-500 text-sm">Waiting for other votes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 gap-4 max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>
      <p className="text-neutral-400 text-sm">Vote for the best argument!</p>

      {isAIRound && (
        <p className="text-amber-400 text-xs">
          &#129302; One argument had AI help...
        </p>
      )}

      <div className="bg-neutral-900 rounded-2xl p-4 w-full">
        <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-2">
          Argument A &mdash; FOR
        </p>
        <p className="text-neutral-200 text-sm leading-relaxed">
          {round.argumentA}
        </p>
      </div>

      <div className="bg-neutral-900 rounded-2xl p-4 w-full">
        <p className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
          Argument B &mdash; AGAINST
        </p>
        <p className="text-neutral-200 text-sm leading-relaxed">
          {round.argumentB}
        </p>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => handleVote(round.debaterA)}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold
                     py-4 rounded-2xl text-xl transition-colors min-h-[60px]"
        >
          Vote A
        </button>
        <button
          onClick={() => handleVote(round.debaterB)}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold
                     py-4 rounded-2xl text-xl transition-colors min-h-[60px]"
        >
          Vote B
        </button>
      </div>

      <Timer durationSec={state.config.voteTimeSec} />
    </div>
  );
}
