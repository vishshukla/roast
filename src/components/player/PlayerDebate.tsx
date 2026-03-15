"use client";
import { useState } from "react";
import type { GameState, PlayerRole } from "@/lib/types";
import Timer from "@/components/ui/Timer";

interface PlayerDebateProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function PlayerDebate({ state, send, role }: PlayerDebateProps) {
  const round = state.currentRound;
  const [argument, setArgument] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!round) return null;

  const isRoundStart = state.phase === "round_start";
  const isDebater = role?.isDebater ?? false;
  const side = role?.side;
  const aiArgument = role?.aiArgument;

  const handleSubmit = () => {
    if (argument.trim() || aiArgument) {
      send({
        type: "submit_argument",
        text: argument.trim() || aiArgument || "",
      });
      setSubmitted(true);
    }
  };

  const handleUseAI = () => {
    if (aiArgument) {
      send({ type: "submit_argument", text: aiArgument });
      setSubmitted(true);
    }
  };

  if (isRoundStart) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
        <h1 className="text-2xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">
          Round {round.roundNumber} of {state.totalRounds}
        </p>
        <p className="text-neutral-400 text-lg animate-pulse">Get ready...</p>
      </div>
    );
  }

  if (!isDebater) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
        <h1 className="text-2xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">
          Round {round.roundNumber} of {state.totalRounds}
        </p>
        <div className="bg-neutral-900 rounded-2xl p-6 w-full text-center">
          <p className="text-neutral-400 text-sm uppercase tracking-wider mb-2">
            Hot Take
          </p>
          <p className="text-xl font-bold">&ldquo;{round.prompt}&rdquo;</p>
        </div>
        <p className="text-neutral-400 animate-pulse">
          Debate in progress... Get ready to vote!
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 max-w-md mx-auto">
        <h1 className="text-2xl font-black tracking-tight">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-green-400 text-xl font-bold">Argument submitted &#10003;</p>
        <p className="text-neutral-400">
          Waiting for the other debater...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 gap-4 max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight">
        ROAST<span className="text-orange-500">.</span>
      </h1>

      <div className="bg-neutral-900 rounded-2xl p-4 w-full text-center">
        <p className="text-neutral-400 text-sm uppercase tracking-wider mb-1">
          Hot Take
        </p>
        <p className="text-lg font-bold">&ldquo;{round.prompt}&rdquo;</p>
      </div>

      <p className={`font-bold text-lg ${side === "A" ? "text-green-400" : "text-red-400"}`}>
        You are arguing {side === "A" ? "FOR" : "AGAINST"}
      </p>

      {aiArgument && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 w-full">
          <p className="text-amber-400 text-sm font-bold mb-2">
            &#129302; AI-Generated Argument
          </p>
          <p className="text-neutral-200 text-sm mb-3">{aiArgument}</p>
          <p className="text-neutral-400 text-xs mb-3">
            Use this AI argument, or write your own. Others will try to guess if
            you used AI.
          </p>
          <button
            onClick={handleUseAI}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold
                       py-3 px-4 rounded-xl text-sm transition-colors w-full"
          >
            Use AI Argument
          </button>
        </div>
      )}

      <textarea
        value={argument}
        onChange={(e) => setArgument(e.target.value.slice(0, 500))}
        placeholder="Write your argument..."
        className="bg-neutral-800 text-white w-full rounded-2xl p-4 outline-none
                   focus:ring-2 focus:ring-orange-500 resize-none h-32 text-base"
      />
      <div className="flex justify-between w-full text-sm">
        <span className="text-neutral-500">{argument.length}/500</span>
        <Timer key={`debate-${round.roundNumber}`} durationSec={state.config.debateTimeSec} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!argument.trim() && !aiArgument}
        className="bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700
                   disabled:text-neutral-500 text-white font-bold
                   py-4 px-8 rounded-2xl text-xl transition-colors w-full"
      >
        Submit
      </button>
    </div>
  );
}
