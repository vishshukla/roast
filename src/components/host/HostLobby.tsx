"use client";
import type { GameState } from "@/lib/types";
import { MIN_PLAYERS } from "@/lib/constants";
import RoomCode from "@/components/ui/RoomCode";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface HostLobbyProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
}

export default function HostLobby({ state, send, playerId }: HostLobbyProps) {
  const players = Object.values(state.players);
  const connectedCount = players.filter((p) => p.connected).length;
  const canStart = connectedCount >= MIN_PLAYERS;
  const isHost = state.players[playerId]?.isHost;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
      <h1 className="text-3xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>

      <RoomCode code={state.roomId} size="lg" />

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <h2 className="text-neutral-400 text-lg">
          Players ({connectedCount})
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {players.map((p) => (
            <div
              key={p.id}
              className={`animate-fade-in ${!p.connected ? "opacity-40" : ""}`}
            >
              <PlayerAvatar name={p.name} color={p.color} size="lg" />
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <p className="text-neutral-500 animate-pulse">
            Waiting for players to join...
          </p>
        )}
      </div>

      {isHost && (
        <button
          onClick={() => send({ type: "start_game" })}
          disabled={!canStart}
          className="bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700
                     disabled:text-neutral-500 text-white font-bold
                     py-4 px-12 rounded-2xl text-xl transition-colors"
        >
          {canStart
            ? "Start Game"
            : `Need ${MIN_PLAYERS - connectedCount} more player${MIN_PLAYERS - connectedCount !== 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
