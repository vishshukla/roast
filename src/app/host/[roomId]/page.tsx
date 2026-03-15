"use client";
import { Suspense, useState, useCallback, use } from "react";
import usePartySocket from "partysocket/react";
import type { GameState, ServerMessage, PlayerRole } from "@/lib/types";
import { MAX_NAME_LENGTH } from "@/lib/constants";
import HostLobby from "@/components/host/HostLobby";
import HostDebate from "@/components/host/HostDebate";
import HostVoting from "@/components/host/HostVoting";
import HostResults from "@/components/host/HostResults";
import HostGameOver from "@/components/host/HostGameOver";

function HostPageInner({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [state, setState] = useState<GameState | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: roomId,
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "state_update") {
        setState(msg.state);
        if (msg.state.phase === "lobby") {
          setRole(null);
        }
      } else if (msg.type === "player_role") {
        setRole(msg.role);
      } else if (msg.type === "error") {
        setError(msg.message);
        setTimeout(() => setError(null), 4000);
      }
    },
  });

  const handleJoin = () => {
    const trimmed = name.trim() || "Host";
    socket.send(JSON.stringify({ type: "join", name: trimmed }));
    setJoined(true);
  };

  const send = useCallback(
    (msg: object) => socket?.send(JSON.stringify(msg)),
    [socket]
  );

  // Show name entry form before joining
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
        <h1 className="text-4xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">Enter your name to host</p>
        <input
          type="text"
          placeholder="Your Name"
          aria-label="Your Name"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && handleJoin()}
          autoFocus
          className="bg-neutral-800 text-white text-center text-xl
                     py-4 px-6 rounded-2xl outline-none w-full max-w-xs
                     focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          className="bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700
                     disabled:text-neutral-500 text-white font-bold
                     py-4 px-8 rounded-2xl text-xl transition-colors w-full max-w-xs"
        >
          Join as Host
        </button>
      </div>
    );
  }

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
        return <HostLobby {...props} />;
      case "round_start":
      case "debate":
        return <HostDebate key={state.currentRound?.roundNumber} {...props} />;
      case "voting":
        return <HostVoting key={`vote-${state.currentRound?.roundNumber}`} {...props} />;
      case "results":
        return <HostResults {...props} />;
      case "game_over":
        return <HostGameOver {...props} />;
      default:
        return <HostLobby {...props} />;
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

export default function HostPage(props: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-neutral-400 text-xl">Loading...</p></div>}>
      <HostPageInner {...props} />
    </Suspense>
  );
}
