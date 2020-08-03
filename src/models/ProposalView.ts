import { ProposalStatus } from './ProposalModel';
import { TechnicalReviewStatus } from './TechnicalReview';
export class ProposalView {
  constructor(
    public id: number,
    public title: string,
    public status: ProposalStatus,
    public shortCode: string,
    public rankOrder: number,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public timeAllocation: number,
    public notified: boolean,
    public technicalStatus: TechnicalReviewStatus,
    public instrumentName: string,
    public callShortCode: string,
    public sepShortCode: string,
    public reviewAverage: number,
    public reviewDeviation: number,
    public instrumentId: number,
    public callId: number
  ) {}
}
