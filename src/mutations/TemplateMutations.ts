/* eslint-disable @typescript-eslint/camelcase */
import {
  cloneTemplateValidationSchema,
  createQuestionTemplateRelationValidationSchema,
  createQuestionValidationSchema,
  createTemplateValidationSchema,
  createTopicValidationSchema,
  deleteQuestionTemplateRelationValidationSchema,
  deleteQuestionValidationSchema,
  deleteTemplateValidationSchema,
  deleteTopicValidationSchema,
  updateQuestionTemplateRelationValidationSchema,
  updateQuestionValidationSchema,
  updateTemplateValidationSchema,
  updateTopicValidationSchema,
} from '@esss-swap/duo-validation';

import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { getQuestionDefinition } from '../models/questionTypes/QuestionRegistry';
import { Roles } from '../models/Role';
import {
  DataType,
  Question,
  Template,
  TemplateCategoryId,
  TemplatesHasQuestions,
  Topic,
} from '../models/Template';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateQuestionArgs } from '../resolvers/mutations/CreateQuestionMutation';
import { CreateQuestionTemplateRelationArgs } from '../resolvers/mutations/CreateQuestionTemplateRelationMutation';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateQuestionArgs } from '../resolvers/mutations/UpdateQuestionMutation';
import { UpdateQuestionTemplateRelationArgs } from '../resolvers/mutations/UpdateQuestionTemplateRelationMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { UpdateTopicArgs } from '../resolvers/mutations/UpdateTopicMutation';
import {
  ConfigBase,
  EmbellishmentConfig,
  FieldConfigType,
  FileUploadConfig,
  SelectionFromOptionsConfig,
  SubtemplateConfig,
} from '../resolvers/types/FieldConfig';
import { logger } from '../utils/Logger';

export default class TemplateMutations {
  constructor(private dataSource: TemplateDataSource) {}

  @ValidateArgs(createTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createTemplate(
    agent: UserWithRole | null,
    args: CreateTemplateArgs
  ): Promise<Template | Rejection> {
    const newTemplate = await this.dataSource
      .createTemplate(args)
      .then(result => result);

    switch (args.categoryId) {
      case TemplateCategoryId.PROPOSAL_QUESTIONARY:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New proposal',
          'proposal_basis'
        );
        break;
      case TemplateCategoryId.SAMPLE_DECLARATION:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New sample',
          'sample_basis'
        );
        break;
    }

    return newTemplate;
  }

  /** cretes first topic, so that template is not empty to begin with */
  private async createInitialTopic(
    templateId: number,
    sortOrder: number,
    title: string,
    firstQuestionId?: string
  ) {
    const newTopic = await this.dataSource.createTopic({
      sortOrder,
      templateId,
      title,
    });

    if (firstQuestionId) {
      const sampleBasisQuestion = await this.dataSource.getQuestion(
        firstQuestionId
      );
      if (!sampleBasisQuestion) {
        logger.logError(
          'Missing question with firstQuestionId from the database',
          { firstQuestionId }
        );

        return rejection('INTERNAL_ERROR');
      }
      await this.dataSource.upsertQuestionTemplateRelations([
        {
          questionId: firstQuestionId,
          sortOrder: 0,
          topicId: newTopic.id,
          templateId: newTopic.templateId,
        } as TemplatesHasQuestions,
      ]);
    }
  }

  @ValidateArgs(cloneTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async cloneTemplate(
    agent: UserWithRole | null,
    {
      templateId,
    }: {
      templateId: number;
    }
  ) {
    const result = await this.dataSource
      .cloneTemplate(templateId)
      .then(result => result);

    return result;
  }

  @ValidateArgs(deleteTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteTemplate(
    user: UserWithRole | null,
    { templateId }: { templateId: number }
  ): Promise<Template | Rejection> {
    return this.dataSource
      .deleteTemplate(templateId)
      .then(template => template)
      .catch(err => {
        logger.logException('Could not delete proposal', err, {
          templateId,
          user,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async getTopicsDataToUpsert(changingTopic: Topic) {
    const allOtherTopics = await this.dataSource.getTopics(
      changingTopic.templateId,
      changingTopic.id
    );

    let dataToUpsert: Topic[] = [];

    if (allOtherTopics?.length) {
      allOtherTopics.splice(changingTopic.sortOrder, 0, {
        ...changingTopic,
      } as Topic);

      const dataToUpdate = allOtherTopics.map((topic, index) => ({
        ...topic,
        sortOrder: index,
      }));

      dataToUpsert.push(...dataToUpdate);
    } else {
      dataToUpsert = [
        {
          ...changingTopic,
        } as Topic,
      ];
    }

    return dataToUpsert;
  }

  @ValidateArgs(createTopicValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createTopic(
    user: UserWithRole | null,
    args: CreateTopicArgs
  ): Promise<Template | Rejection> {
    const dataToUpsert = await this.getTopicsDataToUpsert({
      ...(args as Topic),
      title: args.title || 'New Topic',
      isEnabled: true,
    });

    return this.dataSource
      .upsertTopics(dataToUpsert)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not create topic', err, {
          user,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateTopicValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateTopic(
    agent: UserWithRole | null,
    args: UpdateTopicArgs
  ): Promise<Template | Rejection> {
    let dataToUpsert = [{ ...args }];

    if (args.sortOrder >= 0) {
      dataToUpsert = await this.getTopicsDataToUpsert(args);
    }

    return this.dataSource
      .upsertTopics(dataToUpsert)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not update topic', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteTopicValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteTopic(
    agent: UserWithRole | null,
    { topicId }: { topicId: number }
  ): Promise<Topic | Rejection> {
    return this.dataSource
      .deleteTopic(topicId)
      .then(topic => topic)
      .catch(err => {
        logger.logException('Could not delete topic', err, { agent, topicId });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(createQuestionValidationSchema(DataType))
  @Authorized([Roles.USER_OFFICER])
  async createQuestion(
    agent: UserWithRole | null,
    args: CreateQuestionArgs
  ): Promise<Question | Rejection> {
    const { dataType, categoryId } = args;
    const newFieldId = `${dataType.toLowerCase()}_${new Date().getTime()}`;

    return this.dataSource
      .createQuestion(
        categoryId,
        newFieldId,
        newFieldId, // natural key defaults to id
        dataType,
        'New question',
        JSON.stringify(getQuestionDefinition(dataType).createBlankConfig())
      )
      .then(question => question)
      .catch(err => {
        logger.logException('Could not create template field', err, {
          agent,
          dataType,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateQuestionValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestion(
    agent: UserWithRole | null,
    args: UpdateQuestionArgs
  ): Promise<Question | Rejection> {
    return this.dataSource
      .updateQuestion(args.id, args)
      .then(question => question)
      .catch(err => {
        logger.logException('Could not update question', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteQuestionValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteQuestion(
    agent: UserWithRole | null,
    { questionId }: { questionId: string }
  ): Promise<Question | Rejection> {
    return this.dataSource
      .deleteQuestion(questionId)
      .then(template => template)
      .catch(err => {
        logger.logException('Could not delete question', err, {
          agent,
          id: questionId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async getQuestionsDataToUpsert(
    changingQuestionRel:
      | CreateQuestionTemplateRelationArgs
      | UpdateQuestionTemplateRelationArgs
  ) {
    const allOtherTopicQuestions = await this.dataSource.getQuestionTemplateRelations(
      changingQuestionRel.templateId,
      changingQuestionRel.topicId as number,
      changingQuestionRel.questionId
    );

    let dataToUpsert: TemplatesHasQuestions[] = [];

    if (allOtherTopicQuestions?.length) {
      allOtherTopicQuestions.splice(changingQuestionRel.sortOrder, 0, {
        ...changingQuestionRel,
      } as TemplatesHasQuestions);

      const dataToUpdate = allOtherTopicQuestions.map(
        (topicQuestion, index) => ({
          ...topicQuestion,
          sortOrder: index,
        })
      );

      dataToUpsert.push(...dataToUpdate);
    } else {
      dataToUpsert = [
        {
          ...changingQuestionRel,
        } as TemplatesHasQuestions,
      ];
    }

    return dataToUpsert;
  }

  @ValidateArgs(updateQuestionTemplateRelationValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestionTemplateRelation(
    agent: UserWithRole | null,
    args: UpdateQuestionTemplateRelationArgs
  ): Promise<Template | Rejection | null> {
    const dataToUpsert = await this.getQuestionsDataToUpsert(args);

    return this.dataSource
      .upsertQuestionTemplateRelations(dataToUpsert)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not update question rel', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteQuestionTemplateRelationValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteQuestionTemplateRelation(
    agent: UserWithRole | null,
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template | Rejection> {
    return this.dataSource
      .deleteQuestionTemplateRelation(args)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not delete question rel', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateTemplate(user: UserWithRole | null, args: UpdateTemplateArgs) {
    return this.dataSource
      .updateTemplate(args)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not update topic order', err, {
          user,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(createQuestionTemplateRelationValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createQuestionTemplateRelation(
    agent: UserWithRole | null,
    args: CreateQuestionTemplateRelationArgs
  ) {
    const question = await this.dataSource.getQuestion(args.questionId);
    const dataToUpsert = await this.getQuestionsDataToUpsert({
      ...args,
      config: JSON.stringify(question?.config),
    });

    return this.dataSource
      .upsertQuestionTemplateRelations(dataToUpsert)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not create question rel', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
