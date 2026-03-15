"use client";
import { useState } from "react";
import type { GameState, PlayerRole } from "@/lib/types";
import Timer from "@/components/ui/Timer";

interface HostVotingProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function HostVoting({ state, send, playerId, role }: HostVotingProps) {
  const round = state.currentRound;
  const [voted, setVoted] = useState(false);
  const [guessed, setGuessed] = useState(false);

  if (!round) return null;

  const isDebater =
    playerId === round.debaterA || playerId === round.debaterB;
  const isAIRound = role?.isAIAssistedRound ?? round.isAIAssistedRound;

  const totalVotes = Object.keys(round.votes).length;
  const votesForA = Object.values(round.votes).filter(
    (v) => v === round.debaterA
  ).length;
  const votesForB = Object.values(round.votes).filter(
    (v) => v === round.debaterB
  ).length;

  const handleVote = (votedFor: string) => {
    send({ type: "submit_vote", votedFor });
    setVoted(true);
  };

  const handleAIGuess = (guessedPlayer: string) => {
    send({ type: "submit_ai_guess", guessedPlayer });
    setGuessed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">Vote for the best argument!</p>
      </div>

      {isAIRound && (
        <p className="text-amber-400 text-sm">
          &#129302; One of these arguments had AI help...
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3">
            Argument A &mdash; FOR
          </p>
          <p className="text-lg leading-relaxed break-words">{round.argumentA}</p>
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
          <p className="text-lg leading-relaxed break-words">{round.argumentB}</p>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold tabular-nums text-orange-500">
              {votesForB}
            </span>
            <span className="text-neutral-500 text-sm ml-1">votes</span>
          </div>
        </div>
      </div>

      <Timer key={`vote-${round.roundNumber}`} durationSec={state.config.voteTimeSec} />

      {/* Host can vote if not a debater */}
      {!isDebater && !voted && (
        <div className="flex gap-4">
          <button
            onClick={() => handleVote(round.debaterA)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold
                       py-3 px-8 rounded-2xl text-lg transition-colors"
          >
            Vote A
          </button>
          <button
            onClick={() => handleVote(round.debaterB)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold
                       py-3 px-8 rounded-2xl text-lg transition-colors"
          >
            Vote B
          </button>
        </div>
      )}

      {!isDebater && voted && !guessed && isAIRound && (
        <div className="text-center">
          <p className="text-green-400 font-bold mb-3">Vote submitted &#10003;</p>
          <p className="text-amber-400 text-sm mb-3">
            &#129302; Which debater had AI help?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleAIGuess(round.debaterA)}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold
                         py-3 px-8 rounded-2xl text-lg transition-colors"
            >
              A
            </button>
            <button
              onClick={() => handleAIGuess(round.debaterB)}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold
                         py-3 px-8 rounded-2xl text-lg transition-colors"
            >
              B
            </button>
          </div>
        </div>
      )}

      {!isDebater && voted && (guessed || !isAIRound) && (
        <p className="text-green-400 font-bold">Vote submitted &#10003;</p>
      )}

      <p className="text-neutral-500 text-sm">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast
      </p>
    </div>
  );
}
