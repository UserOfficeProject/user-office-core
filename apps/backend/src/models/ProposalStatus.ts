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

export class ProposalStatus {
  constructor(
    public id: number,
    public shortCode: string,
    public name: string,
    public description: string,
    public isDefault: boolean
  ) {}
}
