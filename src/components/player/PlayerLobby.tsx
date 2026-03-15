"use client";
import type { GameState, PlayerRole } from "@/lib/types";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface PlayerLobbyProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function PlayerLobby({ state, playerId }: PlayerLobbyProps) {
  const me = state.players[playerId];
  const otherPlayers = Object.values(state.players).filter(
    (p) => p.id !== playerId
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>

      {me && (
        <div className="text-center">
          <p className="text-green-400 font-bold text-lg mb-1">
            You&apos;re in!
          </p>
          <PlayerAvatar name={me.name} color={me.color} size="lg" />
        </div>
      )}

      <p className="text-neutral-400 animate-pulse">
        Waiting for host to start...
      </p>

      {otherPlayers.length > 0 && (
        <div className="w-full">
          <p className="text-neutral-500 text-sm text-center mb-3">
            Other players
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {otherPlayers.map((p) => (
              <div key={p.id} className="animate-fade-in">
                <PlayerAvatar name={p.name} color={p.color} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
