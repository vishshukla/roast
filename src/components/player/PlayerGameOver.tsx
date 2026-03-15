"use client";
import type { GameState, PlayerRole } from "@/lib/types";
import { sortByScore } from "@/lib/utils";

interface PlayerGameOverProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function PlayerGameOver({ state, playerId }: PlayerGameOverProps) {
  const me = state.players[playerId];
  const sorted = sortByScore(state.players);
  const myRank = sorted.findIndex((p) => p.id === playerId) + 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>

      <p className="text-neutral-400">Game Over!</p>

      {me && (
        <div className="text-center">
          {myRank === 1 && <p className="text-6xl mb-4">&#127942;</p>}
          <p className="text-4xl font-black mb-2">
            #{myRank}
          </p>
          <p className="text-orange-500 text-2xl font-bold">{me.score} pts</p>
          <p className="text-neutral-400 mt-1">{me.name}</p>
        </div>
      )}

      <div className="w-full">
        <h3 className="text-neutral-400 text-sm uppercase tracking-wider text-center mb-3">
          Final Standings
        </h3>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                p.id === playerId ? "bg-neutral-800" : ""
              }`}
            >
              <span className="text-neutral-500 font-mono text-sm w-6">
                #{i + 1}
              </span>
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-medium truncate max-w-[120px]">
                {p.name}
              </span>
              <span className="text-orange-500 font-bold ml-auto tabular-nums">
                {p.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-neutral-500 text-sm animate-pulse">
        Waiting for host to start a new game...
      </p>
    </div>
  );
}
