import { AllocationTimeUnits } from './Call';
import { TechnicalReviewStatus } from './TechnicalReview';
export class ProposalView {
  constructor(
    public primaryKey: number,
    public title: string,
    public principalInvestigatorId: number,
    public statusId: number,
    public statusName: string,
    public statusDescription: string,
    public proposalId: string,
    public rankOrder: number,
    public finalStatus: number, // Should use ProposalEndStatus enum here
    public notified: boolean,
    public submitted: boolean,
    public managementTimeAllocations: number[],
    public technicalReviewIds: number[],
    public technicalReviewAssigneeIds: number[],
    public technicalTimeAllocations: number[],
    public technicalReviewAssigneeNames: string[],
    public technicalStatuses: TechnicalReviewStatus[],
    public technicalReviewsSubmitted: boolean[],
    public instrumentNames: string[],
    public instrumentIds: number[],
    public fapInstrumentId: number,
    public callShortCode: string,
    public fapCode: string,
    public fapId: number,
    public reviewAverage: number,
    public reviewDeviation: number,
    public allocationTimeUnit: AllocationTimeUnits,
    public callId: number,
    public workflowId: number
  ) {}
}
