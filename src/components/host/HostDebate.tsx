"use client";
import { useState } from "react";
import type { GameState, PlayerRole } from "@/lib/types";
import { getPlayerName } from "@/lib/utils";
import Timer from "@/components/ui/Timer";

interface HostDebateProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
  role: PlayerRole | null;
}

export default function HostDebate({ state, send, playerId, role }: HostDebateProps) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          ROAST<span className="text-orange-500">.</span>
        </h1>
        <p className="text-neutral-400">
          Round {round.roundNumber} of {state.totalRounds}
        </p>
      </div>

      <div className="bg-neutral-900 rounded-2xl p-8 max-w-2xl w-full text-center">
        <p className="text-neutral-400 text-sm uppercase tracking-wider mb-3">
          Hot Take
        </p>
        <p className="text-2xl md:text-3xl font-bold leading-snug">
          &ldquo;{round.prompt}&rdquo;
        </p>
      </div>

      {!isRoundStart && (
        <>
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-green-400 font-bold text-sm uppercase tracking-wider">
                FOR
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: state.players[round.debaterA]?.color,
                  }}
                />
                <span className="text-xl font-semibold">
                  {getPlayerName(state.players, round.debaterA)}
                </span>
                {round.argumentA === "__submitted__" && (
                  <span className="text-green-400 ml-1">&#10003;</span>
                )}
              </div>
            </div>

            <div className="text-neutral-600 text-3xl font-black">VS</div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
                AGAINST
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: state.players[round.debaterB]?.color,
                  }}
                />
                <span className="text-xl font-semibold">
                  {getPlayerName(state.players, round.debaterB)}
                </span>
                {round.argumentB === "__submitted__" && (
                  <span className="text-green-400 ml-1">&#10003;</span>
                )}
              </div>
            </div>
          </div>

          <Timer key={`debate-${round.roundNumber}`} durationSec={state.config.debateTimeSec} />

          {/* Host is a debater — show input controls */}
          {isDebater && !submitted && (
            <div className="w-full max-w-xl">
              <p className={`font-bold text-lg text-center mb-3 ${side === "A" ? "text-green-400" : "text-red-400"}`}>
                You are arguing {side === "A" ? "FOR" : "AGAINST"}
              </p>

              {aiArgument && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-amber-400 text-sm font-bold mb-2">
                    &#129302; AI-Generated Argument
                  </p>
                  <p className="text-neutral-200 text-sm mb-3">{aiArgument}</p>
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
                autoFocus
                className="bg-neutral-800 text-white w-full rounded-2xl p-4 outline-none
                           focus:ring-2 focus:ring-orange-500 resize-none h-32 text-base"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-neutral-500 text-sm">{argument.length}/500</span>
                <button
                  onClick={handleSubmit}
                  disabled={!argument.trim() && !aiArgument}
                  className="bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700
                             disabled:text-neutral-500 text-white font-bold
                             py-3 px-8 rounded-2xl text-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {isDebater && submitted && (
            <p className="text-green-400 text-lg font-bold">Argument submitted &#10003;</p>
          )}

          {!isDebater && (
            <p className="text-neutral-500 text-sm">
              Debaters are writing their arguments...
            </p>
          )}
        </>
      )}

      {isRoundStart && (
        <p className="text-neutral-400 text-lg animate-pulse">
          Get ready...
        </p>
      )}
    </div>
  );
}
