import { Review, ReviewStatus } from '../models/Review';
import { SEPProposalWithReviewGradesAndRanking } from '../models/SEP';

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
  reviews
    ?.filter((review) => review.status === ReviewStatus.SUBMITTED)
    .map((review) => review.grade as number) ?? [];

export const sortByRankOrder = (
  a: SEPProposalWithReviewGradesAndRanking,
  b: SEPProposalWithReviewGradesAndRanking
) => {
  if (a.rankOrder === b.rankOrder || (!a.rankOrder && !b.rankOrder)) {
    return -1;
  } else if (a.rankOrder === null) {
    return 1;
  } else if (b.rankOrder === null) {
    return -1;
  } else {
    return (a.rankOrder as number) > (b.rankOrder as number) ? 1 : -1;
  }
};

export const sortByRankOrAverageScore = (
  data: SEPProposalWithReviewGradesAndRanking[]
) => {
  return data
    .map((proposalData) => {
      const proposalAverageScore = average(proposalData.reviewGrades) || 0;

      return {
        ...proposalData,
        proposalAverageScore,
      };
    })
    .sort((a, b) => (a.proposalAverageScore > b.proposalAverageScore ? 1 : -1))
    .sort(sortByRankOrder);
};
