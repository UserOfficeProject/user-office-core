// Default proposal status short codes that are available
export enum ProposalStatusDefaultShortCodes {
  DRAFT = 'DRAFT',
  FEASIBILITY_REVIEW = 'FEASIBILITY_REVIEW',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  SEP_SELECTION = 'SEP_SELECTION',
  SEP_REVIEW = 'SEP_REVIEW',
  ALLOCATED = 'ALLOCATED',
  NOT_ALLOCATED = 'NOT_ALLOCATED',
  SCHEDULING = 'SCHEDULING',
  EXPIRED = 'EXPIRED',
  EDITABLE_SUBMITTED = 'EDITABLE_SUBMITTED',
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
