export class Experiment {
  constructor(
    public experiment_pk: number,
    public experimentId: string,
    public startsAt: Date,
    public endsAt: Date,
    public scheduledEventId: number,
    public proposalPk: number,
    public status: string,
    public localContact: number,
    public instrumentId: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class ExperimentHasSamples {
  constructor(
    public experimentPk: number,
    public sampleId: number,
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
    public saftyReviewQuestionaryId: number,
    public reviewedBy: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
