import { AllocationTimeUnits } from './Call';
import { TechnicalReviewStatus } from './TechnicalReview';
export class ProposalView {
  constructor(
    public primaryKey: number,
    public title: string,
    public statusId: number,
    public statusName: string,
    public statusDescription: string,
    public proposalId: string,
    public rankOrder: number,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public notified: boolean,
    public technicalTimeAllocation: number,
    public managementTimeAllocation: number,
    public technicalReviewAssigneeId: number,
    public technicalReviewAssigneeFirstName: string,
    public technicalReviewAssigneeLastName: string,
    public technicalStatus: TechnicalReviewStatus,
    public technicalReviewSubmitted: boolean,
    public instrumentName: string,
    public callShortCode: string,
    public sepCode: string,
    public sepId: number,
    public reviewAverage: number,
    public reviewDeviation: number,
    public instrumentId: number,
    public allocationTimeUnit: AllocationTimeUnits,
    public callId: number,
    public submitted: boolean
  ) {}
}
