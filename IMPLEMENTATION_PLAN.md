# ROAST — Implementation Plan

## Completed
- [x] Project scaffolding and dependencies
- [x] Shared library (types, constants, utils, prompts)
- [x] PartyKit server with full game state machine
- [x] API route for Claude integration
- [x] All page routes (landing, host, player)
- [x] All host components (Lobby, Debate, Voting, Results, GameOver)
- [x] All player components (Lobby, Debate, Voting, Results, GameOver)
- [x] UI components (Timer, RoomCode, ScoreBoard, PlayerAvatar, JoinForm)
- [x] CSS animations (fade-in, confetti, phase transitions)
- [x] Unit tests for utils, constants, prompts, game logic
- [x] Fix: useState reset between rounds via key props
- [x] Fix: Timer reset between rounds
- [x] Fix: play_again timer cleanup
- [x] Fix: handleSubmitAIGuess phase guard + validation
- [x] Fix: Tie-break scoring fairness
- [x] Fix: Error toast display
- [x] Fix: Suspense boundaries for both pages
- [x] Fix: Ghost player cleanup on play-again
- [x] Fix: Role state reset on lobby transition
- [x] Fix: isAIAssistedRound sanitization
- [x] Fix: API route error responses
- [x] Fix: Mobile responsive improvements
- [x] README rewrite

## In Progress

## Backlog — Game Flow & Polish
- [x] Add debater selection history tracking — avoid repeating same pair across rounds
- [ ] Add "round_start" countdown animation (3-2-1 style reveal)
- [ ] Add score change animations on results screen (+100, +50, +150 fly-in)
- [ ] Add persistent scoreboard strip visible during debate/voting phases on host
- [ ] Add sound-free visual "ding" effect when timer hits 10s
- [ ] Show "X/Y votes in" progress on host voting screen

## Backlog — Robustness
- [ ] Handle player reconnection mid-game (match by name or token)
- [ ] Add input validation on server for malformed messages (runtime type checking)
- [ ] Add rate limiting / origin check on API route for production
- [x] Import and use FALLBACK_PROMPTS from prompts.ts in room.ts instead of duplicates
- [ ] Handle edge case: all non-debaters disconnect during voting (vacuous allVoted)

## Backlog — UX Improvements
- [ ] Add focus-visible:ring styles to all interactive buttons
- [ ] Memoize confetti random values to prevent re-render shuffling
- [ ] Add loading spinner between join and server confirmation
- [ ] Show recovery UI when join is rejected (reset joined state on error)
- [ ] Add subtle background gradient/animation during debate phase for energy

## Backlog — Testing
- [ ] Add component render tests for key components
- [ ] Add test for ghost player cleanup on play-again
- [ ] Add test for isAIAssistedRound sanitization
- [ ] Add test for tie-break scoring (all voters get bonus)
- [ ] E2E test: simulate full 5-round game via WebSocket messages
