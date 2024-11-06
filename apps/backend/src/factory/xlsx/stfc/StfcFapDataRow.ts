import { stripHtml } from 'string-strip-html';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { StfcUserDataSource } from '../../../datasources/stfc/StfcUserDataSource';
import { QuestionaryStep } from '../../../models/Questionary';
import { Review } from '../../../models/Review';
import { CallRowObj } from '../callFaps';
import { RowObj } from '../fap';
import { getDataRow } from '../FapDataRow';

export async function getStfcDataRow(
  proposalPk: number,
  piName: string,
  proposalAverageScore: number,
  instrument: string,
  instrumentAvailabilityTime: number,
  fapTimeAllocation: number | null,
  proposalTitle: string,
  proposalId: number | null,
  technicalReviewTimeAllocation: number | null,
  technicalReviewComment: string | null,
  propFapRankOrder: number | null,
  proposer_id: number | null,
  proposalAnswers: QuestionaryStep[] | null,
  reviews: Review[] | null
) {
  const stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  const individualReviews = reviews
    ? await Promise.all(
        reviews.map(async (rev) => {
          const reviewer = await stfcUserDataSource.getBasicUserInfo(
            rev.userID
          );

          return [
            reviewer
              ? `${reviewer.preferredname} ${reviewer.lastname} `
              : '<missing>',
            rev.grade,
            rev.comment && stripHtml(rev.comment).result,
          ];
        })
      )
    : null;

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
      proposalPk,
      piName,
      proposalAverageScore,
      instrument,
      instrumentAvailabilityTime,
      fapTimeAllocation,
      proposalTitle,
      proposalId,
      technicalReviewTimeAllocation,
      technicalReviewComment,
      propFapRankOrder
    ),
    daysRequested,
    reviews: individualReviews,
    piCountry: piCountry,
  };
}

export function populateStfcRow(row: RowObj) {
  return [
    row.propShortCode ?? '<missing>',
    row.principalInv ?? '<missing>',
    row.piCountry ?? '<missing>',
    row.instrName ?? '<missing>',
    row.daysRequested ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.techReviewComment ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
  ].concat(row.reviews ? row.reviews?.flat() : []);
}

export function callFapStfcPopulateRow(row: CallRowObj): (string | number)[] {
  return [
    row.propShortCode ?? '<missing>',
    row.principalInv ?? '<missing>',
    row.piCountry ?? '<missing>',
    row.instrName ?? '<missing>',
    row.daysRequested ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.techReviewComment ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
  ]
    .concat(row.reviews ? row.reviews?.flat() : [])
    .concat([
      row.fapTimeAllocation ?? row.daysRequested ?? '<missing>',
      row.fapMeetingDecision ?? '<missing>',
      row.fapMeetingInComment ?? '<missing>',
      row.fapMeetingExComment ?? '<missing>',
    ]);
}
