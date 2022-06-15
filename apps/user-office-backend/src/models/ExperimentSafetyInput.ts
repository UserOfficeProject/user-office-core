import 'reflect-metadata';

export class ExperimentSafetyInput {
  constructor(
    public id: number,
    public scheduledEventId: number,
    public creatorId: number,
    public questionaryId: number,
    public isSubmitted: boolean,
    public created: Date
  ) {}
}
