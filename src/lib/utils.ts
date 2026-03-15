export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I or O (confusing)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getPlayerName(
  players: Record<string, { name: string }>,
  id: string
): string {
  return players[id]?.name || "Unknown";
}

export function sortByScore(
  players: Record<string, { name: string; score: number; color: string; id: string }>
): Array<{ name: string; score: number; color: string; id: string }> {
  return Object.values(players).sort((a, b) => b.score - a.score);
}
