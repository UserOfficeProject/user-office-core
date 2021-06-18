import { AllocationTimeUnits } from './Call';
import { TechnicalReviewStatus } from './TechnicalReview';
export class ProposalView {
  constructor(
    public id: number,
    public title: string,
    public statusId: number,
    public statusName: string,
    public statusDescription: string,
    public shortCode: string,
    public rankOrder: number,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public timeAllocation: number,
    public notified: boolean,
    public technicalStatus: TechnicalReviewStatus,
    public instrumentName: string,
    public callShortCode: string,
    public sepId: number,
    public sepCode: string,
    public reviewAverage: number,
    public reviewDeviation: number,
    public instrumentId: number,
    public callId: number,
    public submitted: boolean,
    public allocationTimeUnit: AllocationTimeUnits
  ) {}
}
