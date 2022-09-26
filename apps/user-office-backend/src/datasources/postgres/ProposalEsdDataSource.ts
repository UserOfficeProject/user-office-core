import { Rejection } from '../../models/Rejection';
import { CreateEsdArgs } from '../../resolvers/mutations/CreateEsdMutation';
import { UpdateEsdArgs } from '../../resolvers/mutations/UpdateEsdMutation';
import { ProposalEsdDataSource } from '../ProposalEsdDataSource';
import { ExperimentSafetyDocument } from './../../models/ExperimentSafetyDocument';
import database from './database';
import { createEsdObject } from './records';

class PostgresProposalEsdDataSource implements ProposalEsdDataSource {
  // Create
  createEsd(
    args: CreateEsdArgs & { reviewerUserId: number }
  ): Promise<ExperimentSafetyDocument | Rejection> {
    return database
      .insert({
        esi_id: args.esiId,
        evaluation: args.evaluation,
        reviewer_user_id: args.reviewerUserId,
      })
      .into('experiment_safety_inputs')
      .returning('*')
      .first()
      .then((result) => createEsdObject(result));
  }

  // Read
  async getEsd(esdId: number): Promise<ExperimentSafetyDocument | null> {
    const result = await database
      .select('*')
      .from('experiment_safety_documents')
      .where('esd_id', esdId)
      .first();

    if (!result) {
      return null;
    }

    return createEsdObject(result);
  }

  // Update
  updateEsd(
    args: UpdateEsdArgs & { reviewerUserId: number }
  ): Promise<ExperimentSafetyDocument | Rejection> {
    return database('experiment_safety_inputs')
      .update({
        evaluation: args.evaluation,
        reviewer_user_id: args.reviewerUserId,
      })
      .into('experiment_safety_inputs')
      .returning('*')
      .first()
      .then((result) => createEsdObject(result));
  }
}

export default PostgresProposalEsdDataSource;
