"use client";
import type { GameState, PlayerRole } from "@/lib/types";
import { sortByScore } from "@/lib/utils";
import ScoreBoard from "@/components/ui/ScoreBoard";

interface HostGameOverProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function HostGameOver({ state, send, playerId }: HostGameOverProps) {
  const sorted = sortByScore(state.players);
  const winner = sorted[0];
  const isHost = state.players[playerId]?.isHost;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8 relative overflow-hidden">
      {/* CSS Confetti */}
      <div className="confetti-container" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#F97316"][
                i % 7
              ],
            }}
          />
        ))}
      </div>

      <div className="text-center z-10">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">Game Over!</p>
      </div>

      {winner && (
        <div className="text-center z-10">
          <p className="text-6xl mb-4">&#127942;</p>
          <p className="text-4xl font-black mb-2">{winner.name}</p>
          <p className="text-orange-500 text-2xl font-bold">{winner.score} pts</p>
        </div>
      )}

      <div className="w-full max-w-md z-10">
        <h3 className="text-neutral-400 text-sm uppercase tracking-wider text-center mb-3">
          Final Standings
        </h3>
        <ScoreBoard players={state.players} />
      </div>

      {isHost && (
        <button
          onClick={() => send({ type: "play_again" })}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold
                     py-4 px-12 rounded-2xl text-xl transition-colors z-10
                     focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
