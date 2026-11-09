import { FapProposalWithReviewGradesAndRanking } from '../models/Fap';
import { Review, ReviewStatus } from '../models/Review';

export const average = (numbers: number[]) => {
  const sum = numbers.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  const avg = sum / numbers.length;

  return avg;
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

export const getGrades = (reviews: Review[] | null | undefined) =>
  reviews
    ?.filter((review) => review.status === ReviewStatus.SUBMITTED)
    .map((review) => parseFloat(review.grade)) ?? [];

const fapMeetingsComparator = (
  a: FapProposalWithReviewGradesAndRanking,
  b: FapProposalWithReviewGradesAndRanking
) => {
  const aNumericReviews = a.reviewGrades
    .filter((gr) => !isNaN(Number(gr)))
    .map((gr) => Number(gr));
  const bNumericReviews = b.reviewGrades
    .filter((gr) => !isNaN(Number(gr)))
    .map((gr) => Number(gr));

  const aAverage = average(aNumericReviews);
  const bAverage = average(bNumericReviews);

  const scoreA = a.meetingScore ?? aAverage;
  const scoreB = b.meetingScore ?? bAverage;
  const numericScoreA = Number(scoreA);
  const numericScoreB = Number(scoreB);
  const isAClassification =
    scoreA != null && scoreA !== '' && isNaN(numericScoreA);
  const isBClassification =
    scoreB != null && scoreB !== '' && isNaN(numericScoreB);

  // Check if no reviews have been done
  if (isNaN(numericScoreA) && isNaN(numericScoreB)) {
    return 0;
  }
  if (isNaN(numericScoreA)) {
    return 1;
  }
  if (isNaN(numericScoreB)) {
    return -1;
  }

  if (isAClassification && isBClassification) {
    return String(scoreA).localeCompare(String(scoreB));
  }
  if (isAClassification) {
    return 1;
  }
  if (isBClassification) {
    return -1;
  }

  if (numericScoreA === numericScoreB) {
    return standardDeviation(aNumericReviews) <
      standardDeviation(bNumericReviews)
      ? -1
      : 1;
  }

  return numericScoreB - numericScoreA;
};

export const sortByGradeOrAverageScore = (
  data: FapProposalWithReviewGradesAndRanking[]
) => {
  return data.sort(fapMeetingsComparator);
};
