import { InstrumentWithAvailabilityTime } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { SEPProposal } from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import { TechnicalReview } from '../../models/TechnicalReview';

export default class SEPDataRow {
  public getRowData(
    piName: string,
    proposalAverageScore: number,
    instrument: InstrumentWithAvailabilityTime,
    sepMeetingDecision: SepMeetingDecision | null,
    proposal: Proposal | null,
    technicalReview: TechnicalReview | null,
    sepProposal?: SEPProposal
  ) {
    return {
      propShortCode: proposal?.proposalId,
      propTitle: proposal?.title,
      principalInv: piName,
      instrAvailTime: instrument.availabilityTime,
      techReviewTimeAllocation: technicalReview?.timeAllocation,
      sepTimeAllocation: sepProposal?.sepTimeAllocation ?? null,
      propReviewAvgScore: proposalAverageScore,
      propSEPRankOrder: sepMeetingDecision?.rankOrder ?? null,
      inAvailZone: null,
    };
  }
}
