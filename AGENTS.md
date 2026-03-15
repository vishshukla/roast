# ROAST — Agent Operational Guide

## Architecture

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Multiplayer:** PartyKit (WebSocket rooms, server-authoritative)
- **AI:** Anthropic Claude API via `src/app/api/generate/route.ts`
- **Styling:** Tailwind CSS v4

## Key Files

| File | Purpose |
|------|---------|
| `src/party/room.ts` | ALL game logic — state machine, scoring, timers |
| `src/lib/types.ts` | Shared TypeScript types |
| `src/lib/constants.ts` | Game config constants |
| `src/app/api/generate/route.ts` | Claude API proxy |
| `src/app/host/[roomId]/page.tsx` | Host screen (TV display) |
| `src/app/play/[roomId]/page.tsx` | Player screen (phone) |
| `src/components/host/*.tsx` | Host phase components |
| `src/components/player/*.tsx` | Player phase components |

## Game Flow

```
LOBBY → ROUND_START (2s) → DEBATE (60s) → VOTING (20s) → RESULTS (8s) → repeat × 5 → GAME_OVER
```

## Backpressure Checks

Before marking a task complete, ALL must pass:
1. `npx tsc --noEmit` — zero errors
2. `npm test` — all tests pass
3. `npm run build` — successful production build

## Commit Rules

- No `Co-Authored-By: Claude` trailer
- Always `git push` after commit
- One focused commit per task

## Testing

- Unit tests in `src/__tests__/` using Vitest
- Test game logic (scoring, sanitization, state transitions) without PartyKit runtime
- Component rendering tests optional but welcome
