export class FapProposalCount {
  constructor(
    public userId: number,
    public count: number
  ) {}
}

export class Fap {
  constructor(
    public id: number,
    public code: string,
    public description: string,
    public numberRatingsRequired: number,
    public gradeGuide: string,
    public customGradeGuide: boolean | null,
    public active: boolean,
    public fapChairUserIds: number[] | null,
    public fapSecretariesUserIds: number[] | null
  ) {}
}

export class FapReviewer {
  constructor(
    public userId: number,
    public fapId: number
  ) {}
}

export class FapProposal {
  constructor(
    public fapProposalId: number,
    public proposalPk: number,
    public fapId: number,
    public dateAssigned: Date,
    public fapTimeAllocation: number | null,
    public instrumentId: number | null,
    public callId: number,
    public fapInstrumentMeetingSubmitted: boolean
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
    public emailSent: boolean,
    public rank: number | null
  ) {}
}
