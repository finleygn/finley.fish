export function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
