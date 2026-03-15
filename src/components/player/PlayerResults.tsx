"use client";
import type { GameState, PlayerRole } from "@/lib/types";
import { getPlayerName, sortByScore } from "@/lib/utils";

interface PlayerResultsProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function PlayerResults({ state, playerId }: PlayerResultsProps) {
  const round = state.currentRound;
  if (!round) return null;

  const me = state.players[playerId];
  const sorted = sortByScore(state.players);
  const myRank = sorted.findIndex((p) => p.id === playerId) + 1;

  const votesForA = Object.values(round.votes).filter(
    (v) => v === round.debaterA
  ).length;
  const votesForB = Object.values(round.votes).filter(
    (v) => v === round.debaterB
  ).length;

  const myVote = round.votes[playerId];
  const majorityChoice =
    votesForA >= votesForB ? round.debaterA : round.debaterB;
  const votedWithMajority = myVote === majorityChoice;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>

      <p className="text-neutral-400">
        Round {round.roundNumber} Results
      </p>

      <div className="bg-neutral-900 rounded-2xl p-6 w-full text-center">
        <p className="text-neutral-400 text-sm mb-2">
          {votesForA} vs {votesForB} votes
        </p>
        <p className="text-lg font-bold">
          {getPlayerName(state.players, round.debaterA)} (FOR) vs{" "}
          {getPlayerName(state.players, round.debaterB)} (AGAINST)
        </p>

        {round.isAIAssistedRound && round.aiAssistedPlayer && (
          <p className="text-amber-400 text-sm mt-2">
            &#129302; {getPlayerName(state.players, round.aiAssistedPlayer)} had AI help!
          </p>
        )}
      </div>

      {myVote && (
        <div className="text-center">
          <p className="text-neutral-300">
            You voted for{" "}
            <span className="font-bold">
              {getPlayerName(state.players, myVote)}
            </span>
          </p>
          <p
            className={
              votedWithMajority ? "text-green-400" : "text-neutral-500"
            }
          >
            {votedWithMajority ? "With the majority! +50" : "Against the majority"}
          </p>
        </div>
      )}

      {me && (
        <div className="text-center">
          <p className="text-orange-500 text-2xl font-bold">{me.score} pts</p>
          <p className="text-neutral-400 text-sm">
            Rank #{myRank} of {sorted.length}
          </p>
        </div>
      )}
    </div>
  );
}
