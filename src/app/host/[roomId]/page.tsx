"use client";
import { useEffect, useState, useCallback, use } from "react";
import usePartySocket from "partysocket/react";
import type { GameState, ServerMessage } from "@/lib/types";
import HostLobby from "@/components/host/HostLobby";
import HostDebate from "@/components/host/HostDebate";
import HostVoting from "@/components/host/HostVoting";
import HostResults from "@/components/host/HostResults";
import HostGameOver from "@/components/host/HostGameOver";

export default function HostPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [state, setState] = useState<GameState | null>(null);
  const [joined, setJoined] = useState(false);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: roomId,
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "state_update") {
        setState(msg.state);
      }
    },
  });

  useEffect(() => {
    if (socket && !joined) {
      const name = prompt("Enter your name:") || "Host";
      socket.send(JSON.stringify({ type: "join", name }));
      setJoined(true);
    }
  }, [socket, joined]);

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

  const props = { state, send, playerId: socket?.id || "" };

  switch (state.phase) {
    case "lobby":
      return <HostLobby {...props} />;
    case "round_start":
    case "debate":
      return <HostDebate {...props} />;
    case "voting":
      return <HostVoting {...props} />;
    case "results":
      return <HostResults {...props} />;
    case "game_over":
      return <HostGameOver {...props} />;
    default:
      return <HostLobby {...props} />;
  }
}
