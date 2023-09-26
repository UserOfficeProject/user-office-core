import { Review } from '../generated/sdk';

export const average = (numbers: number[]) => {
  const sum = numbers.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  const avg = sum / numbers.length;

  return Number(avg.toFixed(2));
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

  return Number(stdDev.toFixed(2));
};

export const getGradesFromReviews = (reviews: Review[]) =>
  reviews
    .map((review) => review.grade)
    .filter((grade): grade is number => typeof grade === 'number');
