export const clamp = (input: number, lower: number, upper: number): number => {
  return Math.min(Math.max(input, lower), upper);
};

export const randomNumberBetween = (min = 0, max = 1): number => {
  return Math.random() * (max - min) + min;
};
