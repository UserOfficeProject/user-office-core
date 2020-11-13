export const clamp = (input: number, lower: number, upper: number): number => {
  return Math.min(Math.max(input, lower), upper);
};
