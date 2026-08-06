import { CallRowObj } from './callFaps';
import { RowObj } from './fap';
import { QuestionaryStep } from '../../models/Questionary';
import { Review } from '../../models/Review';

export type FapDataRowInput = {
  proposalPk: number;
  piName: string;
  proposalAverageScore: number;
  instrumentName: string;
  instrumentAvailabilityTime: number;
  fapTimeAllocation: number | null;
  proposalTitle: string;
  proposalId: number | null;
  techReviewTimeAllocation: number | null;
  technicalReviewComment: string | null;
  propFapRankOrder: number | null;
  proposerId: number | null;
  proposalAnswers: QuestionaryStep[] | null;
  reviews: Review[] | null;
  instrumentId: number;
};

export type FapDataRow = (input: FapDataRowInput) => RowObj | Promise<RowObj>;

export function getDataRow({
  proposalPk,
  piName,
  proposalAverageScore,
  instrumentName,
  instrumentAvailabilityTime,
  fapTimeAllocation,
  proposalTitle,
  proposalId,
  techReviewTimeAllocation,
  technicalReviewComment,
  propFapRankOrder,
}: FapDataRowInput): RowObj {
  return {
    proposalPk: proposalPk,
    propShortCode: proposalId?.toString(),
    propTitle: proposalTitle,
    principalInv: piName,
    instrName: instrumentName,
    instrAvailTime: instrumentAvailabilityTime,
    techReviewTimeAllocation: techReviewTimeAllocation,
    techReviewComment: technicalReviewComment,
    fapTimeAllocation: fapTimeAllocation,
    propReviewAvgScore: proposalAverageScore,
    propFapRankOrder: propFapRankOrder,
    inAvailZone: null,
  };
}

export function populateRow(row: RowObj) {
  return [
    row.propShortCode ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.principalInv,
    row.instrName ?? '<missing>',
    row.instrAvailTime ?? '<missing>',
    row.techReviewTimeAllocation ?? '<missing>',
    row.fapTimeAllocation ?? row.techReviewTimeAllocation ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
    row.propFapRankOrder ?? '<missing>',
    row.inAvailZone ?? '<missing>',
  ];
}

export function callFapPopulateRow(row: CallRowObj): (string | number)[] {
  return [
    row.propShortCode ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.principalInv,
    row.instrName ?? '<missing>',
    row.instrAvailTime ?? '<missing>',
    row.techReviewTimeAllocation ?? '<missing>',
    row.fapTimeAllocation ?? row.techReviewTimeAllocation ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
    row.propFapRankOrder ?? '<missing>',
    row.inAvailZone ?? '<missing>',
    row.fapTimeAllocation ?? row.timeRequested ?? '<missing>',
    row.fapMeetingDecision ?? '<missing>',
    row.fapMeetingInComment ?? '<missing>',
    row.fapMeetingExComment ?? '<missing>',
  ].concat(row.reviews ? row.reviews?.flatMap((a) => a) : []);
}
