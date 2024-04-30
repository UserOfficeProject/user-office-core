import { InstrumentWithAvailabilityTime } from '../../../models/Instrument';
import { Proposal } from '../../../models/Proposal';
import { SEPProposal } from '../../../models/SEP';
import { SepMeetingDecision } from '../../../models/SepMeetingDecision';
import { TechnicalReview } from '../../../models/TechnicalReview';
import { RowObj } from '../sep';
import { getDataRow } from '../SEPDataRow';

export function getStfcDataRow(
  piName: string,
  proposalAverageScore: number,
  instrument: InstrumentWithAvailabilityTime,
  sepMeetingDecision: SepMeetingDecision | null,
  proposal: Proposal | null,
  technicalReview: TechnicalReview | null,
  sepProposal?: SEPProposal
) {
  return {
    ...getDataRow(
      piName,
      proposalAverageScore,
      instrument,
      sepMeetingDecision,
      proposal,
      technicalReview,
      sepProposal
    ),
    instrName: instrument.name,
    feedback: sepMeetingDecision?.commentForUser,
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
    row.sepTimeAllocation ?? row.techReviewTimeAllocation ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
    row.propSEPRankOrder ?? '<missing>',
    row.inAvailZone ?? '<missing>',
    row.feedback ?? '<missing>',
  ];
}
