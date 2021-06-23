export class SEP {
  constructor(
    public id: number,
    public code: string,
    public description: string,
    public numberRatingsRequired: number,
    public active: boolean,
    public sepChairUserId: number | null,
    public sepSecretaryUserId: number | null
  ) {}
}

export class SEPReviewer {
  constructor(public userId: number, public sepId: number) {}
}

export class SEPProposal {
  constructor(
    public proposalPk: number,
    public sepId: number,
    public dateAssigned: Date,
    public sepTimeAllocation: number | null,
    public instrumentSubmitted?: boolean
  ) {}
}

export class SEPProposalWithReviewGradesAndRanking {
  constructor(
    public proposalPk: number,
    public rankOrder: number | null,
    public reviewGrades: number[]
  ) {}
}

export class SEPAssignment {
  constructor(
    public proposalPk: number,
    public sepMemberUserId: number | null,
    public sepId: number,
    public dateAssigned: Date,
    public reassigned: boolean,
    public dateReassigned: Date | null,
    public emailSent: boolean
  ) {}
}
