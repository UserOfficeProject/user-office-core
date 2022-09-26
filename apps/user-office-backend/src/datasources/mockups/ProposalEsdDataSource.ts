import { ExperimentSafetyDocument } from '../../models/ExperimentSafetyDocument';
import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { CreateEsdArgs } from '../../resolvers/mutations/CreateEsdMutation';
import { UpdateEsdArgs } from '../../resolvers/mutations/UpdateEsdMutation';
import { ProposalEsdDataSource } from '../ProposalEsdDataSource';

export class ProposalEsdDataSourceMock implements ProposalEsdDataSource {
  esis: ExperimentSafetyInput[];
  constructor() {
    this.init();
  }
  updateEsd(
    args: UpdateEsdArgs & { reviewerUserId: number }
  ): Promise<Rejection | ExperimentSafetyDocument> {
    throw new Error('Method not implemented.');
  }
  createEsd(
    args: CreateEsdArgs & { reviewerUserId: number }
  ): Promise<ExperimentSafetyDocument | Rejection> {
    throw new Error('Method not implemented.');
  }
  getEsd(esdId: number): Promise<ExperimentSafetyDocument | null> {
    throw new Error('Method not implemented.');
  }

  public init() {
    // this.esis = [new ExperimentSafetyDocument(1, 1, 1, 1, false, new Date())];
  }
}
