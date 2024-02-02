import { stripHtml } from 'string-strip-html';

import { StfcUserDataSource } from '../../../datasources/stfc/StfcUserDataSource';
import { FapProposal } from '../../../models/Fap';
import { FapMeetingDecision } from '../../../models/FapMeetingDecision';
import { InstrumentWithAvailabilityTime } from '../../../models/Instrument';
import { Proposal } from '../../../models/Proposal';
import { QuestionaryStep } from '../../../models/Questionary';
import { Review } from '../../../models/Review';
import { TechnicalReview } from '../../../models/TechnicalReview';
import { RowObj } from '../fap';
import { getDataRow } from '../FapDataRow';

const stfcUserDataSource = new StfcUserDataSource();

export async function getStfcDataRow(
  piName: string,
  proposalAverageScore: number,
  instrument: InstrumentWithAvailabilityTime,
  fapMeetingDecision: FapMeetingDecision | null,
  proposal: Proposal | null,
  technicalReview: TechnicalReview | null,
  fapProposal: FapProposal | null,
  proposalAnswers: QuestionaryStep[] | null,
  reviews: Review[] | null
) {
  const daysRequested = proposalAnswers
    ?.flatMap((step) => step.fields)
    .find((answer) => answer.question.naturalKey === 'days_requested')?.value;

  const piDetails = await stfcUserDataSource.getStfcBasicPeopleByUserNumbers([
    proposal?.proposerId.toString() ?? '',
  ]);

  const piCountry = piDetails.find(
    (user) => user.userNumber === proposal?.proposerId.toString()
  )?.country;

  return {
    ...getDataRow(
      piName,
      proposalAverageScore,
      instrument,
      fapMeetingDecision,
      proposal,
      technicalReview,
      fapProposal
    ),
    instrName: instrument.name,
    feedback: fapMeetingDecision?.commentForUser,
    daysRequested,
    reviews,
    piCountry: piCountry,
  };
}

export function populateStfcRow(row: RowObj) {
  const individualReviews = row.reviews?.flatMap((rev) => [
    rev.grade,
    stripHtml(rev.comment).result,
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
