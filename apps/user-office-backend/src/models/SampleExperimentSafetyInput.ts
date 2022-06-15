import 'reflect-metadata';

export class SampleExperimentSafetyInput {
  constructor(
    public esiId: number,
    public sampleId: number,
    public questionaryId: number,
    public isSubmitted: boolean
  ) {}
}
