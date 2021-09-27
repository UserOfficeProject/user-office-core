import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { GenericTemplate } from '../../models/GenericTemplate';
import { UpdateGenericTemplateArgs } from '../../resolvers/mutations/UpdateGenericTemplateMutation';
import { GenericTemplateArgs } from '../../resolvers/queries/GenericTemplateQuery';
import { GenericTemplateDataSource } from '../GenericTemplateDataSource';
import { QuestionaryDataSource } from '../QuestionaryDataSource';
import database from './database';
import { createGenericTemplateObject, GenericTemplateRecord } from './records';

@injectable()
export default class PostgresGenericTemplateDataSource
  implements GenericTemplateDataSource
{
  constructor(
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource
  ) {}
  async cloneGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate> {
    const sourceGenericTemplate = await this.getGenericTemplate(
      genericTemplateId
    );
    if (!sourceGenericTemplate) {
      logger.logError(
        'Could not clone genericTemplate because source genericTemplate does not exist',
        { genericTemplateId }
      );
      throw new Error('Could not clone genericTemplate');
    }

    const newQuestionary = await this.questionaryDataSource.clone(
      sourceGenericTemplate.questionaryId
    );

    const newGenericTemplate = await this.create(
      sourceGenericTemplate.title,
      sourceGenericTemplate.creatorId,
      sourceGenericTemplate.proposalPk,
      newQuestionary.questionaryId,
      sourceGenericTemplate.questionId
    );

    return newGenericTemplate;
  }
  delete(genericTemplateId: number): Promise<GenericTemplate> {
    return database('genericTemplates')
      .where({ genericTemplate_id: genericTemplateId })
      .delete('*')
      .then((records: GenericTemplateRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not delete genericTemplate', {
            genericTemplateId,
          });
          throw new Error('Could not delete genericTemplate');
        }

        return createGenericTemplateObject(records[0]);
      });
  }

  updateGenericTemplate(
    args: UpdateGenericTemplateArgs
  ): Promise<GenericTemplate> {
    return database('genericTemplates')
      .update(
        {
          title: args.title,
          proposal_pk: args.proposalPk,
          questionary_id: args.questionaryId,
          shipment_id: args.shipmentId,
        },
        '*'
      )
      .where({ genericTemplate_id: args.genericTemplateId })
      .then((records: GenericTemplateRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update genericTemplate', { args });
          throw new Error('Could not update genericTemplate');
        }

        return createGenericTemplateObject(records[0]);
      });
  }

  create(
    title: string,
    creator_id: number,
    proposal_pk: number,
    questionary_id: number,
    question_id: string
  ): Promise<GenericTemplate> {
    return database('genericTemplates')
      .insert(
        { title, creator_id, proposal_pk, questionary_id, question_id },
        '*'
      )
      .then((records: GenericTemplateRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not create genericTemplate', {
            title,
            creator_id,
            proposal_pk,
            questionary_id,
          });
          throw new Error('Failed to insert genericTemplate');
        }

        return createGenericTemplateObject(records[0]);
      });
  }

  getGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate | null> {
    return database('genericTemplates')
      .select('*')
      .where('genericTemplate_id', genericTemplateId)
      .first()
      .then((genericTemplate?: GenericTemplateRecord) => {
        if (!genericTemplate) {
          logger.logError('GenericTemplate does not exist', {
            genericTemplateId,
          });
        }

        return genericTemplate
          ? createGenericTemplateObject(genericTemplate)
          : null;
      });
  }

  getGenericTemplatesByCallId(callId: number): Promise<GenericTemplate[]> {
    return database('proposals')
      .join(
        'genericTemplates',
        'proposals.proposal_pk',
        'genericTemplates.proposal_pk'
      )
      .select('genericTemplates.*')
      .where(' proposals.call_id', callId)
      .then((records: GenericTemplateRecord[]) => {
        return (
          records.map((record) => createGenericTemplateObject(record)) || []
        );
      });
  }

  async getGenericTemplates(
    args: GenericTemplateArgs
  ): Promise<GenericTemplate[]> {
    const filter = args.filter;

    return database('genericTemplates')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.questionaryIds) {
          query.where('questionary_id', 'in', filter.questionaryIds);
        }
        if (filter?.title) {
          query.where('title', 'like', `%${filter.title}%`);
        }
        if (filter?.genericTemplateIds) {
          query.where('genericTemplate_id', 'in', filter.genericTemplateIds);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
        }
        if (filter?.questionId) {
          query.where('question_id', filter.questionId);
        }
      })
      .select('*')
      .orderBy('created_at', 'asc')
      .then((records: GenericTemplateRecord[]) =>
        records.map((record) => createGenericTemplateObject(record))
      );
  }

  getGenericTemplatesByShipmentId(
    shipmentId: number
  ): Promise<GenericTemplate[]> {
    return database('shipments_has_genericTemplates')
      .leftJoin(
        'genericTemplates',
        'shipments_has_genericTemplates.genericTemplate_id',
        'genericTemplates.genericTemplate_id'
      )
      .select('genericTemplates.*')
      .where(' shipments_has_genericTemplates.shipment_id', shipmentId)
      .then((records: GenericTemplateRecord[]) => {
        return (
          records.map((record) => createGenericTemplateObject(record)) || []
        );
      });
  }
}
