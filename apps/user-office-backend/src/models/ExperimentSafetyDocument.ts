import 'reflect-metadata';
import { EsdEvaluation } from './EsdEvaluation';

export class ExperimentSafetyDocument {
  constructor(
    public id: number,
    public esiId: number,
    public reviewerUserId: number,
    public evaluation: EsdEvaluation,
    public createdAt: Date,
    public evaluatedAt: Date
  ) {}
}
