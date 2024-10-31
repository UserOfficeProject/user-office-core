import {
  FapInstrument,
  ProposalViewFap,
  ProposalViewInstrument,
  ProposalViewTechnicalReview,
  ProposalViewTechnique,
} from '../resolvers/types/ProposalView';
import { AllocationTimeUnits } from './Call';
export class ProposalView {
  constructor(
    public primaryKey: number,
    public title: string,
    public principalInvestigatorId: number,
    public statusId: number,
    public statusName: string,
    public statusDescription: string,
    public proposalId: string,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public notified: boolean,
    public submitted: boolean,
    public instruments: ProposalViewInstrument[] | null,
    public technicalReviews: ProposalViewTechnicalReview[] | null,
    public faps: ProposalViewFap[] | null,
    public fapInstruments: FapInstrument[] | null,
    public callShortCode: string,
    public allocationTimeUnit: AllocationTimeUnits,
    public callId: number,
    public workflowId: number,
    public submittedDate: Date,
    public techniques: ProposalViewTechnique[] | null,
    public commentByScientist: string
  ) {}
}
