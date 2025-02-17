export class Experiment {
  constructor(
    public experimentPk: number,
    public experimentId: string,
    public startsAt: Date,
    public endsAt: Date,
    public scheduledEventId: number,
    public proposalPk: number,
    public status: string,
    public localContactId: number | null,
    public instrumentId: number,
    public createdAt: Date,
    public updatedAt: Date
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

export class ExperimentSafety {
  constructor(
    public experimentSafetyPk: number,
    public experimentPk: number,
    public esiQuestionaryId: number,
    public createdBy: number,
    public status: string,
    public safetyReviewQuestionaryId: number,
    public reviewedBy: number | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
