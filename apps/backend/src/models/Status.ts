import { WorkflowType } from './Workflow';

// Default proposal status short codes that are available
export enum ProposalStatusDefaultShortCodes {
  DRAFT = 'DRAFT',
  FEASIBILITY_REVIEW = 'FEASIBILITY_REVIEW',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  FAP_SELECTION = 'FAP_SELECTION',
  FAP_REVIEW = 'FAP_REVIEW',
  ALLOCATED = 'ALLOCATED',
  NOT_ALLOCATED = 'NOT_ALLOCATED',
  SCHEDULING = 'SCHEDULING',
  EXPIRED = 'EXPIRED',
  EDITABLE_SUBMITTED = 'EDITABLE_SUBMITTED',
  EDITABLE_SUBMITTED_INTERNAL = 'EDITABLE_SUBMITTED_INTERNAL',
  FAP_AND_FEASIBILITY_REVIEW = 'FAP_AND_FEASIBILITY_REVIEW',
}

// Default experiment safety workflow status short codes
export enum ExperimentSafetyWorkflowStatusCodes {
  AWAITING_ESF = 'AWAITING_ESF',
  ESF_IS_REVIEW = 'ESF_IS_REVIEW',
  ESF_ESR_REVIEW = 'ESF_ESR_REVIEW',
  ESF_REJECTED = 'ESF_REJECTED',
  ESF_APPROVED = 'ESF_APPROVED',
}

export class Status {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public isDefault: boolean,
    public entityType: WorkflowType
  ) {}
}
