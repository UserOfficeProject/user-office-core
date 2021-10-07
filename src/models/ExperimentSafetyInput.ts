import 'reflect-metadata';

export class ExperimentSafetyInput {
  constructor(
    public id: number,
    public visitId: number,
    public creatorId: number,
    public questionaryId: number,
    public isSubmitted: boolean,
    public created: Date
  ) {}
}
