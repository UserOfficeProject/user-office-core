import { FapProposalWithReviewGradesAndRanking } from '../models/Fap';
import { Review, ReviewStatus } from '../models/Review';

export const average = (numbers: number[]) => {
  const sum = numbers.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  const avg = sum / numbers.length;

  return avg;
};

export const getGrades = (reviews: Review[] | null | undefined) =>
  reviews
    ?.filter((review) => review.status === ReviewStatus.SUBMITTED)
    .map((review) => review.grade as number) ?? [];

export const sortByRankOrder = (
  a: FapProposalWithReviewGradesAndRanking,
  b: FapProposalWithReviewGradesAndRanking
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
  data: FapProposalWithReviewGradesAndRanking[]
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
