// Simple deterministic hash → 0–1 float
export function seededDelay(seed: string, max = 0.6) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return normalized * max;
}
