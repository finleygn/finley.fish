export function lerp(s: number, e: number, t: number) {
  return (1 - t) * s + t * e
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export function cubicPulse(c: number, w: number, x: number): number {
  x = Math.abs(x - c);
  if (x > w) return 0.0;
  x /= w;
  return 1.0 - x * x * (3.0 - 2.0 * x);
}