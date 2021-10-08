import { Review } from '../generated/sdk';

export const average = (numbers: number[]) => {
  const sum = numbers.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  const avg = sum / numbers.length;

  return avg;
};

export const absoluteDifference = (numbers: number[]) => {
  if (numbers.length < 2) {
    return NaN;
  }
  numbers = numbers.sort();

  return Math.abs(numbers[numbers.length - 1] - numbers[0]);
};

export const standardDeviation = (numbers: number[]) => {
  if (numbers.length < 2) {
    return NaN;
  }
  const avg = average(numbers);

  const squareDiffs = numbers?.map(function (value) {
    const diff = value - avg;
    const sqrDiff = diff * diff;

    return sqrDiff;
  });

  const avgSquareDiff = average(squareDiffs);

  const stdDev = Math.sqrt(avgSquareDiff);

  return stdDev;
};

export const getGrades = (reviews: Review[] | null | undefined) =>
  reviews?.map((review) => review.grade as number) ?? [];
