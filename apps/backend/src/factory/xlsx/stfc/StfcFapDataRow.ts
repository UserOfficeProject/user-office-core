import { FapProposal } from '../../../models/Fap';
import { FapMeetingDecision } from '../../../models/FapMeetingDecision';
import { InstrumentWithAvailabilityTime } from '../../../models/Instrument';
import { Proposal } from '../../../models/Proposal';
import { TechnicalReview } from '../../../models/TechnicalReview';
import { RowObj } from '../fap';
import { getDataRow } from '../FapDataRow';

export function getStfcDataRow(
  piName: string,
  proposalAverageScore: number,
  instrument: InstrumentWithAvailabilityTime,
  fapMeetingDecision: FapMeetingDecision | null,
  proposal: Proposal | null,
  technicalReview: TechnicalReview | null,
  fapProposal?: FapProposal
) {
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
  };
}

export function populateStfcRow(row: RowObj) {
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
    row.feedback ?? '<missing>',
  ];
}
