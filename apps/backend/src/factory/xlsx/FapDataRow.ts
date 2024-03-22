import { FapProposal } from '../../models/Fap';
import { FapMeetingDecision } from '../../models/FapMeetingDecision';
import { InstrumentWithAvailabilityTime } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { TechnicalReview } from '../../models/TechnicalReview';
import { RowObj } from './fap';

export function getDataRow(
  piName: string,
  proposalAverageScore: number,
  instrument: InstrumentWithAvailabilityTime,
  fapMeetingDecision: FapMeetingDecision | null,
  proposal: Proposal | null,
  technicalReview: TechnicalReview | null,
  fapProposal: FapProposal | null
) {
  return {
    propShortCode: proposal?.proposalId,
    propTitle: proposal?.title,
    principalInv: piName,
    instrName: instrument.name,
    instrAvailTime: instrument.availabilityTime,
    techReviewTimeAllocation: technicalReview?.timeAllocation,
    fapTimeAllocation: fapProposal?.fapTimeAllocation ?? null,
    propReviewAvgScore: proposalAverageScore,
    propFapRankOrder: fapMeetingDecision?.rankOrder ?? null,
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
