import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { GenericTemplate } from '../../models/GenericTemplate';
import { UpdateGenericTemplateArgs } from '../../resolvers/mutations/UpdateGenericTemplateMutation';
import { GenericTemplatesArgs } from '../../resolvers/queries/GenericTemplatesQuery';
import { SubTemplateConfig } from '../../resolvers/types/FieldConfig';
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
    genericTemplateId: number,
    reviewBeforeSubmit?: boolean
  ): Promise<GenericTemplate> {
    const sourceGenericTemplate =
      await this.getGenericTemplate(genericTemplateId);
    if (!sourceGenericTemplate) {
      logger.logError(
        'Could not clone genericTemplate because source genericTemplate does not exist',
        { genericTemplateId }
      );
      throw new GraphQLError('Could not clone genericTemplate');
    }

    const newQuestionary = await this.questionaryDataSource.clone(
      sourceGenericTemplate.questionaryId,
      reviewBeforeSubmit
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
    return database('generic_templates')
      .where({ generic_template_id: genericTemplateId })
      .delete('*')
      .then((records: GenericTemplateRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not delete genericTemplate', {
            genericTemplateId,
          });
          throw new GraphQLError('Could not delete genericTemplate');
        }

        return createGenericTemplateObject(records[0]);
      });
  }

  updateGenericTemplate(
    args: UpdateGenericTemplateArgs
  ): Promise<GenericTemplate> {
    return database('generic_templates')
      .update(
        {
          title: args.title,
          proposal_pk: args.proposalPk,
          questionary_id: args.questionaryId,
        },
        '*'
      )
      .where({ generic_template_id: args.genericTemplateId })
      .then((records: GenericTemplateRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update genericTemplate', { args });
          throw new GraphQLError('Could not update genericTemplate');
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
    return database('generic_templates')
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
            question_id,
          });
          throw new GraphQLError('Failed to insert genericTemplate');
        }

        return createGenericTemplateObject(records[0]);
      })
      .catch((err) => {
        return err;
      });
  }

  async createGenericTemplateWithCopiedAnswers(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    templateId: number,
    questionId: string,
    sourceQuestionaryId: number
  ): Promise<GenericTemplate> {
    const newGenericTemplate = await this.create(
      title,
      creatorId,
      proposalPk,
      questionaryId,
      questionId
    );
    const subTemplate = await database('templates_has_questions')
      .select('*')
      .first()
      .where({ question_id: newGenericTemplate.questionId })
      .then((result) => {
        if (!result) {
          throw new GraphQLError(
            `Generic template value does not exist ID: ${templateId}`
          );
        }

        return {
          config: result.config as SubTemplateConfig,
          topicId: result.topic_id,
        };
      });

    if (subTemplate.config.canCopy === false) {
      throw new GraphQLError(
        `Coping generic template questionary is not allowed ID: ${questionaryId}`
      );
    }

    if (!subTemplate.topicId) {
      throw new GraphQLError(
        `Can not create generic template because topic does not exist ID: ${templateId}`
      );
    }
    await this.questionaryDataSource.copyAnswers(
      sourceQuestionaryId,
      newGenericTemplate.questionaryId,
      !!subTemplate.config.isCompleteOnCopy
    );

    return newGenericTemplate;
  }

  getGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate | null> {
    return database('generic_templates')
      .select('*')
      .where('generic_template_id', genericTemplateId)
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

  async getGenericTemplates(
    args: GenericTemplatesArgs
  ): Promise<GenericTemplate[]> {
    const filter = args.filter;

    return database('generic_templates')
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
          query.where('generic_template_id', 'in', filter.genericTemplateIds);
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
}
