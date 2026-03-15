"use client";
import type { GameState } from "@/lib/types";
import { getPlayerName } from "@/lib/utils";
import Timer from "@/components/ui/Timer";

interface HostDebateProps {
  state: GameState;
  send: (msg: object) => void;
  playerId: string;
}

export default function HostDebate({ state }: HostDebateProps) {
  const round = state.currentRound;
  if (!round) return null;

  const isRoundStart = state.phase === "round_start";

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
          <div className="flex gap-12 items-start">
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

          <Timer durationSec={state.config.debateTimeSec} />

          <p className="text-neutral-500 text-sm">
            Debaters are writing their arguments...
          </p>
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
