export function clamp(input: number, lower: number, upper: number) {
  return Math.min(Math.max(input, lower), upper);
}
