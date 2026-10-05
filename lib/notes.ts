export function parseTargetNote(content: string): { name: string; pct: number } | null {
  const match = content.trim().match(/^Target (.+): .+ \(([\d.,]+)%\)$/);
  if (!match) return null;
  const pct = Number(match[2].replace(",", "."));
  if (Number.isNaN(pct)) return null;
  return { name: match[1], pct: Math.max(0, Math.min(100, pct)) };
}