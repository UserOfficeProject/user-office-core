export const clamp = (input: number, lower: number, upper: number): number => {
  return Math.min(Math.max(input, lower), upper);
};

export const midNumberBetween = (min = 0, max = 1): number => {
  return +((max + min) / 2).toFixed(14);
};
