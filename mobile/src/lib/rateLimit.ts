// Throttle cliente (UX + reduce ruido). NO es seguridad: el límite real vive en el servidor.
export function createLimiter(max: number, windowMs: number) {
  let hits: number[] = [];
  return function allow(): boolean {
    const now = Date.now();
    hits = hits.filter((t) => now - t < windowMs);
    if (hits.length >= max) return false;
    hits.push(now);
    return true;
  };
}
