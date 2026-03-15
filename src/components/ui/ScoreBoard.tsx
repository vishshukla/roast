import { sortByScore } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface ScoreBoardProps {
  players: Record<string, Player>;
  highlightId?: string;
  compact?: boolean;
}

export default function ScoreBoard({ players, highlightId, compact }: ScoreBoardProps) {
  const sorted = sortByScore(players);

  return (
    <div className={`flex ${compact ? "gap-4 justify-center flex-wrap" : "flex-col gap-2"}`}>
      {sorted.map((p, i) => (
        <div
          key={p.id}
          className={`flex items-center gap-3 ${compact ? "px-3 py-1" : "px-4 py-2"}
                      rounded-xl ${p.id === highlightId ? "bg-neutral-800" : ""}`}
        >
          <span className="text-neutral-500 font-mono text-sm w-6">
            #{i + 1}
          </span>
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="font-medium truncate max-w-[120px]">{p.name}</span>
          <span className="text-orange-500 font-bold ml-auto tabular-nums">
            {p.score}
          </span>
        </div>
      ))}
    </div>
  );
}
