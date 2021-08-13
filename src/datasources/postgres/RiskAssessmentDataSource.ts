import { Rejection } from '../../models/Rejection';
import { RiskAssessment } from '../../models/RiskAssessment';
import { RiskAssessmentsFilter } from '../../queries/RiskAssessmentQueries';
import { CreateRiskAssessmentArgs } from '../../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../../resolvers/mutations/UpdateRiskAssessmentMutation';
import { RiskAssessmentDataSource } from '../RiskAssessmentDataSource';
import { RiskAssessmentStatus } from './../../models/RiskAssessment';
import database from './database';
import { createRiskAssessmentObject, RiskAssessmentRecord } from './records';

class PostgresRiskAssessmentDataSource implements RiskAssessmentDataSource {
  async createRiskAssessment(
    { proposalPk }: CreateRiskAssessmentArgs,
    creatorId: number
  ): Promise<RiskAssessment> {
    return database('risk_assessments')
      .insert({
        proposal_pk: proposalPk,
        creator_user_id: creatorId,
        status: RiskAssessmentStatus.DRAFT,
      })
      .returning('*')
      .then((riskAssessment) => createRiskAssessmentObject(riskAssessment[0]));
  }

  async getRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | null> {
    return database('risk_assessments')
      .select('*')
      .where({ risk_assessment_id: riskAssessmentId })
      .first()
      .then((riskAssessment) =>
        riskAssessment ? createRiskAssessmentObject(riskAssessment) : null
      );
  }

  async getRiskAssessments(
    filter: RiskAssessmentsFilter
  ): Promise<RiskAssessment[]> {
    const { proposalPk, questionaryIds } = filter;

    return database('risk_assessments')
      .select('*')
      .modify((query) => {
        if (proposalPk) {
          query.where({ proposal_pk: proposalPk });
        }
        if (questionaryIds) {
          query.whereIn('questionary_id', questionaryIds);
        }
      })
      .then((riskAssessments: RiskAssessmentRecord[]) =>
        riskAssessments.map((ra) => createRiskAssessmentObject(ra))
      );
  }

  async updateRiskAssessment(
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection> {
    return database('risk_assessments')
      .update({ questionary_id: args.questionaryId, status: args.status })
      .where({ risk_assessment_id: args.riskAssessmentId })
      .returning('*')
      .then(async (riskAssessments) => {
        return createRiskAssessmentObject(riskAssessments[0]);
      });
  }

  async deleteRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | Rejection> {
    return database('risk_assessments')
      .where({ riskAssessment_id: riskAssessmentId })
      .delete()
      .returning('*')
      .then((riskAssessments) => {
        return createRiskAssessmentObject(riskAssessments[0]);
      });
  }
}

export default PostgresRiskAssessmentDataSource;
