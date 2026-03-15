"use client";
import { Suspense, useEffect, useState, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import type { GameState, ServerMessage, PlayerRole } from "@/lib/types";
import PlayerLobby from "@/components/player/PlayerLobby";
import PlayerDebate from "@/components/player/PlayerDebate";
import PlayerVoting from "@/components/player/PlayerVoting";
import PlayerResults from "@/components/player/PlayerResults";
import PlayerGameOver from "@/components/player/PlayerGameOver";

function PlayPageInner({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name") || "Player";

  const [state, setState] = useState<GameState | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: roomId,
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "state_update") {
        setState(msg.state);
      } else if (msg.type === "player_role") {
        setRole(msg.role);
      } else if (msg.type === "error") {
        setError(msg.message);
        setTimeout(() => setError(null), 4000);
      }
    },
  });

  useEffect(() => {
    if (socket && !joined) {
      socket.send(JSON.stringify({ type: "join", name: playerName }));
      setJoined(true);
    }
  }, [socket, joined, playerName]);

  const send = useCallback(
    (msg: object) => socket?.send(JSON.stringify(msg)),
    [socket]
  );

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-400 text-xl">Connecting...</p>
      </div>
    );
  }

  const props = { state, send, playerId: socket?.id || "", role };

  const phaseComponent = (() => {
    switch (state.phase) {
      case "lobby":
        return <PlayerLobby {...props} />;
      case "round_start":
      case "debate":
        return <PlayerDebate key={state.currentRound?.roundNumber} {...props} />;
      case "voting":
        return <PlayerVoting key={`vote-${state.currentRound?.roundNumber}`} {...props} />;
      case "results":
        return <PlayerResults {...props} />;
      case "game_over":
        return <PlayerGameOver {...props} />;
      default:
        return <PlayerLobby {...props} />;
    }
  })();

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-2xl font-bold z-50 animate-fade-in">
          {error}
        </div>
      )}
      {phaseComponent}
    </>
  );
}

export default function PlayPage(props: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-neutral-400 text-xl">Loading...</p></div>}>
      <PlayPageInner {...props} />
    </Suspense>
  );
}
