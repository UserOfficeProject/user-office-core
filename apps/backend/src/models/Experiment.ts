export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export class Experiment {
  constructor(
    public experimentPk: number,
    public experimentId: string,
    public startsAt: Date,
    public endsAt: Date,
    public scheduledEventId: number,
    public proposalPk: number,
    public status: ExperimentStatus,
    public localContactId: number | null,
    public instrumentId: number,
    public createdAt: Date,
    public updatedAt: Date,
    public referenceNumberSequence: number | null
  ) {}
}

export class ExperimentHasSample {
  constructor(
    public experimentPk: number,
    public sampleId: number,
    public isEsiSubmitted: boolean,
    public sampleEsiQuestionaryId: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export enum InstrumentScientistDecision {
  UNSET = 0,
  ACCEPTED,
  REJECTED,
}

export enum InstrumentScientistDecisionEnum {
  UNSET = 0,
  ACCEPTED,
  REJECTED,
}

export enum ExperimentSafetyReviewerDecisionEnum {
  UNSET = 0,
  ACCEPTED,
  REJECTED,
}

export class ExperimentSafety {
  constructor(
    public experimentSafetyPk: number,
    public experimentPk: number,
    public esiQuestionaryId: number,
    public esiQuestionarySubmittedAt: Date | null,
    public createdBy: number,
    public statusId: number | null,
    public safetyReviewQuestionaryId: number | null,
    public reviewedBy: number | null,
    public createdAt: Date,
    public updatedAt: Date,
    public instrumentScientistDecision: InstrumentScientistDecisionEnum | null,
    public instrumentScientistComment: string | null,
    public experimentSafetyReviewerDecision: ExperimentSafetyReviewerDecisionEnum | null,
    public experimentSafetyReviewerComment: string | null
  ) {}
}
