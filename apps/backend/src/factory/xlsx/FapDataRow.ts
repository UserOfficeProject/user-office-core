import { RowObj } from './fap';

export function getDataRow(
  proposalPk: number,
  piName: string,
  proposalAverageScore: number,
  instrumentName: string,
  instrumentAvailabilityTime: number,
  fapTimeAllocation: number | null,
  proposalTitle: string,
  proposalId: number | null,
  techReviewTimeAllocation: number | null,
  propFapRankOrder: number | null
): RowObj {
  return {
    proposalPk: proposalPk,
    propShortCode: proposalId?.toString(),
    propTitle: proposalTitle,
    principalInv: piName,
    instrName: instrumentName,
    instrAvailTime: instrumentAvailabilityTime,
    techReviewTimeAllocation: techReviewTimeAllocation,
    fapTimeAllocation: fapTimeAllocation ?? null,
    propReviewAvgScore: proposalAverageScore ?? 0,
    propFapRankOrder: propFapRankOrder ?? null,
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
