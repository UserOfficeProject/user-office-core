import {
  createTemplateValidationSchema,
  cloneTemplateValidationSchema,
  deleteTemplateValidationSchema,
  createTopicValidationSchema,
  updateTopicValidationSchema,
  deleteTopicValidationSchema,
  createQuestionValidationSchema,
  updateQuestionValidationSchema,
  deleteQuestionValidationSchema,
  updateQuestionRelValidationSchema,
  deleteQuestionRelValidationSchema,
  updateTopicOrderValidationSchema,
  updateQuestionsTopicRelsValidationSchema,
  updateProposalTemplateValidationSchema,
  createQuestionRelValidationSchema,
} from '@esss-swap/duo-validation';

import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import {
  createConfig,
  DataType,
  Template,
  Question,
  Topic,
} from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateQuestionArgs } from '../resolvers/mutations/CreateQuestionMutation';
import { CreateQuestionRelArgs } from '../resolvers/mutations/CreateQuestionRelMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateQuestionArgs } from '../resolvers/mutations/UpdateQuestionMutation';
import { UpdateQuestionRelArgs } from '../resolvers/mutations/UpdateQuestionRelMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { UpdateTopicArgs } from '../resolvers/mutations/UpdateTopicMutation';
import {
  ConfigBase,
  EmbellishmentConfig,
  FieldConfigType,
  FileUploadConfig,
  SelectionFromOptionsConfig,
} from '../resolvers/types/FieldConfig';
import { logger } from '../utils/Logger';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';

export default class TemplateMutations {
  constructor(private dataSource: TemplateDataSource) {}

  @ValidateArgs(createTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createTemplate(
    agent: UserWithRole | null,
    args: CreateTemplateArgs
  ): Promise<Template | Rejection> {
    const result = await this.dataSource
      .createTemplate(args)
      .then(result => result);

    return result;
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
  ): Promise<unknown> {
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

  @ValidateArgs(createTopicValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createTopic(
    user: UserWithRole | null,
    args: CreateTopicArgs
  ): Promise<Template | Rejection> {
    return this.dataSource
      .createTopic(args)
      .then(response => response)
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
  ): Promise<Topic | Rejection> {
    return this.dataSource
      .updateTopic(args.id, args)
      .then(topic => topic)
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
    const { dataType } = args;
    const newFieldId = `${dataType.toLowerCase()}_${new Date().getTime()}`;

    return this.dataSource
      .createQuestion(
        newFieldId,
        newFieldId, // natural key defaults to id
        dataType,
        'New question',
        JSON.stringify(this.createBlankConfig(dataType))
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

  @ValidateArgs(updateQuestionRelValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestionRel(
    agent: UserWithRole | null,
    args: UpdateQuestionRelArgs
  ): Promise<Template | Rejection> {
    return this.dataSource
      .updateQuestionRel(args)
      .then(steps => steps)
      .catch(err => {
        logger.logException('Could not update question rel', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteQuestionRelValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteQuestionRel(
    agent: UserWithRole | null,
    args: DeleteQuestionRelArgs
  ): Promise<Template | Rejection> {
    return this.dataSource
      .deleteQuestionRel(args)
      .then(steps => steps)
      .catch(err => {
        logger.logException('Could not delete question rel', err, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateTopicOrderValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateTopicOrder(
    agent: UserWithRole | null,
    { topicOrder }: { topicOrder: number[] }
  ): Promise<number[] | Rejection> {
    return this.dataSource
      .updateTopicOrder(topicOrder)
      .then(order => order)
      .catch(err => {
        logger.logException('Could not update topic order', err, {
          agent,
          topicOrder,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateQuestionsTopicRelsValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestionsTopicRels(
    agent: UserWithRole | null,
    args: {
      templateId: number;
      topicId: number;
      questionIds: string[];
    }
  ): Promise<string[] | Rejection> {
    let isSuccess = true;
    let index = 1;
    for (const questionId of args.questionIds) {
      const updatedField = await this.dataSource.updateQuestionRel({
        questionId,
        topicId: args.topicId,
        templateId: args.templateId,
        sortOrder: index,
      });
      isSuccess = isSuccess && updatedField != null;
      index++;
    }
    if (isSuccess === false) {
      return rejection('INTERNAL_ERROR');
    }

    return args.questionIds;
  }

  @ValidateArgs(updateProposalTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  updateTemplate(user: UserWithRole | null, args: UpdateTemplateArgs) {
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

  @ValidateArgs(createQuestionRelValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createQuestionRel(
    user: UserWithRole | null,
    args: CreateQuestionRelArgs
  ) {
    return this.dataSource
      .createQuestionRel(args)
      .then(data => data)
      .catch(err => {
        logger.logException('Could not create Question Relation', err, {
          user,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  private createBlankConfig(dataType: DataType): typeof FieldConfigType {
    switch (dataType) {
      case DataType.FILE_UPLOAD:
        return createConfig<FileUploadConfig>(new FileUploadConfig());
      case DataType.EMBELLISHMENT:
        return createConfig<EmbellishmentConfig>(new EmbellishmentConfig(), {
          plain: 'New embellishment',
          html: '<p>New embellishment</p>',
        });
      case DataType.SELECTION_FROM_OPTIONS:
        return createConfig<SelectionFromOptionsConfig>(
          new SelectionFromOptionsConfig()
        );
      default:
        return new ConfigBase();
    }
  }
}
