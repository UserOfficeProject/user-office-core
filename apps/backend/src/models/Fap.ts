export class Fap {
  constructor(
    public id: number,
    public code: string,
    public description: string,
    public numberRatingsRequired: number,
    public gradeGuide: string,
    public customGradeGuide: boolean | null,
    public active: boolean,
    public fapChairUserId: number | null,
    public fapSecretaryUserId: number | null
  ) {}
}

export class FapReviewer {
  constructor(public userId: number, public fapId: number) {}
}

export class FapProposal {
  constructor(
    public proposalPk: number,
    public fapId: number,
    public dateAssigned: Date,
    public fapTimeAllocation: number | null,
    public instrumentSubmitted?: boolean
  ) {}
}

export class FapProposalWithReviewGradesAndRanking {
  constructor(
    public proposalPk: number,
    public rankOrder: number | null,
    public reviewGrades: number[]
  ) {}
}

export class FapAssignment {
  constructor(
    public proposalPk: number,
    public fapMemberUserId: number | null,
    public fapId: number,
    public dateAssigned: Date,
    public reassigned: boolean,
    public dateReassigned: Date | null,
    public emailSent: boolean
  ) {}
}
