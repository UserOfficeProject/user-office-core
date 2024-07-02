export class Call {
  constructor(
    public id: number,
    public shortCode: string,
    public startCall: Date,
    public endCall: Date,
    public endCallInternal: Date,
    public startReview: Date,
    public endReview: Date,
    public startFapReview: Date,
    public endFapReview: Date,
    public startNotify: Date,
    public endNotify: Date,
    public startCycle: Date,
    public endCycle: Date,
    public cycleComment: string,
    public surveyComment: string,
    public submissionMessage: string,
    public referenceNumberFormat: string,
    public proposalSequence: number,
    public proposalWorkflowId: number,
    public callEnded: boolean,
    public callEndedInternal: boolean,
    public callReviewEnded: boolean,
    public callFapReviewEnded: boolean,
    public templateId: number,
    public esiTemplateId: number | undefined,
    public allocationTimeUnit: AllocationTimeUnits,
    public title: string,
    public description: string,
    public pdfTemplateId: number | undefined,
    public isActive: boolean,
    public needTechReview: boolean
  ) {}
}

export enum AllocationTimeUnits {
  Day = 'day',
  Hour = 'hour',
  Week = 'week',
}
