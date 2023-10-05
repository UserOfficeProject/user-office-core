import { InstrumentWithAvailabilityTime } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { SEPProposal } from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import { TechnicalReview } from '../../models/TechnicalReview';
import SEPDataRow from './SEPDataRow';

export class StfcSEPDataRow extends SEPDataRow {
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
      ...super.getRowData(
        piName,
        proposalAverageScore,
        instrument,
        sepMeetingDecision,
        proposal,
        technicalReview,
        sepProposal
      ),
      instrName: instrument.name,
      feedback: sepMeetingDecision?.commentForUser ?? null,
    };
  }
}
