import { logger } from '@esss-swap/duo-logger';

import { Rejection } from '../../models/Rejection';
import { RiskAssessment } from '../../models/RiskAssessment';
import { Sample } from '../../models/Sample';
import { RiskAssessmentsFilter } from '../../queries/RiskAssessmentQueries';
import { CreateRiskAssessmentArgs } from '../../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../../resolvers/mutations/UpdateRiskAssessmentMutation';
import { RiskAssessmentDataSource } from '../RiskAssessmentDataSource';
import { RiskAssessmentStatus } from './../../models/RiskAssessment';
import database from './database';
import {
  createRiskAssessmentObject,
  RiskAssessmentRecord,
  createSampleObject,
} from './records';

class PostgresRiskAssessmentDataSource implements RiskAssessmentDataSource {
  async createRiskAssessment(
    { proposalPk, scheduledEventId }: CreateRiskAssessmentArgs,
    creatorId: number
  ): Promise<RiskAssessment> {
    return database('risk_assessments')
      .insert({
        proposal_pk: proposalPk,
        scheduled_event_id: scheduledEventId,
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
    const { proposalPk, questionaryIds, scheduledEventId } = filter;

    return database('risk_assessments')
      .select('*')
      .modify((query) => {
        if (proposalPk) {
          query.where({ proposal_pk: proposalPk });
        }
        if (scheduledEventId) {
          query.andWhere('scheduled_event_id', scheduledEventId);
        }
        if (questionaryIds) {
          query.whereIn('questionary_id', questionaryIds);
        }
      })
      .then((riskAssessments: RiskAssessmentRecord[]) =>
        riskAssessments.map((ra) => createRiskAssessmentObject(ra))
      );
  }

  async getRiskAssessmentSamples(riskAssessmentId: number): Promise<Sample[]> {
    return database('risk_assessments_has_samples')
      .where('risk_assessment_id', riskAssessmentId)
      .leftJoin(
        'samples',
        'risk_assessments_has_samples.sample_id',
        'samples.sample_id'
      )
      .select('samples.*')
      .then((results) => results.map((record) => createSampleObject(record)));
  }

  async updateRiskAssessment(
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment> {
    const { riskAssessmentId, sampleIds, status, questionaryId } = args;

    return database
      .transaction(async (trx) => {
        try {
          if (sampleIds) {
            await database('risk_assessments_has_samples')
              .delete()
              .where('risk_assessment_id', riskAssessmentId)
              .transacting(trx);

            if (sampleIds.length > 0) {
              const rowsToInsert = sampleIds.map((sampleId) => ({
                risk_assessment_id: riskAssessmentId,
                sample_id: sampleId,
              }));

              await database('risk_assessments_has_samples')
                .insert(rowsToInsert)
                .transacting(trx);
            }
          }

          if (questionaryId || status) {
            await database('risk_assessments')
              .update({ questionary_id: questionaryId, status: status })
              .where({ risk_assessment_id: riskAssessmentId })
              .returning('*')
              .transacting(trx)
              .then(async (riskAssessments) =>
                createRiskAssessmentObject(riskAssessments[0])
              );
          }

          return trx.commit();
        } catch (error) {
          logger.logError('Can not update risk assessment', {
            msg: error.message,
          });
          trx.rollback();
        }
      })
      .then(async () => {
        const updatedRiskAssessment = await this.getRiskAssessment(
          riskAssessmentId
        );
        if (updatedRiskAssessment === null) {
          throw new Error('Could not update risk assessment');
        }

        return updatedRiskAssessment;
      })
      .catch((exception) => {
        throw new Error('Could not update risk assessment');
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
