import { stripHtml } from 'string-strip-html';

import { StfcUserDataSource } from '../../../datasources/stfc/StfcUserDataSource';
import { QuestionaryStep } from '../../../models/Questionary';
import { Review } from '../../../models/Review';
import { RowObj } from '../fap';
import { getDataRow } from '../FapDataRow';

const stfcUserDataSource = new StfcUserDataSource();

export async function getStfcDataRow(
  piName: string,
  proposalAverageScore: number,
  instrument: string,
  instrumentAvailabilityTime: number,
  fapTimeAllocation: number | null,
  proposalTitle: string,
  proposalId: number | null,
  technicalReviewTimeAllocation: number | null,
  propFapRankOrder: number | null,
  proposer_id: number | null,
  proposalAnswers: QuestionaryStep[] | null,
  reviews: Review[] | null
) {
  const daysRequested = proposalAnswers
    ?.flatMap((step) => step.fields)
    .find((answer) => answer.question.naturalKey === 'days_requested')
    ?.value.value;

  const piDetails = await stfcUserDataSource.getStfcBasicPeopleByUserNumbers([
    proposer_id?.toString() ?? '',
  ]);

  const piCountry = piDetails.find(
    (user) => user.userNumber === proposer_id?.toString()
  )?.country;

  return {
    ...getDataRow(
      piName,
      proposalAverageScore,
      instrument,
      instrumentAvailabilityTime,
      fapTimeAllocation,
      proposalTitle,
      proposalId,
      technicalReviewTimeAllocation,
      propFapRankOrder
    ),
    daysRequested,
    reviews,
    piCountry: piCountry,
  };
}

export function populateStfcRow(row: RowObj) {
  const individualReviews = row.reviews?.flatMap((rev) => [
    rev.grade,
    rev.comment && stripHtml(rev.comment).result,
  ]);

  return [
    row.propShortCode ?? '<missing>',
    row.principalInv ?? '<missing>',
    row.piCountry ?? '<missing>',
    row.instrName ?? '<missing>',
    row.daysRequested ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
  ].concat(individualReviews ? individualReviews : []);
}
