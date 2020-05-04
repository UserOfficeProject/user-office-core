export class SEP {
  constructor(
    public id: number,
    public code: string,
    public description: string,
    public numberRatingsRequired: number,
    public active: boolean
  ) {}
}

export class SEPMember {
  constructor(
    public roleUserId: number,
    public roleId: number,
    public userId: number,
    public sepId: number
  ) {}
}

export class SEPAssignment {
  constructor(
    public proposalId: number | null,
    public sepMemberUserId: number,
    public sepId: number,
    public dateAssigned: Date,
    public reassigned: boolean,
    public dateReassigned: Date | null,
    public emailSent: boolean
  ) {}
}
