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
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { getQuestionDefinition } from '../models/questionTypes/QuestionRegistry';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import {
  DataType,
  Question,
  Template,
  TemplatesHasQuestions,
  Topic,
  TemplateGroupId,
} from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateQuestionArgs } from '../resolvers/mutations/CreateQuestionMutation';
import { CreateQuestionTemplateRelationArgs } from '../resolvers/mutations/CreateQuestionTemplateRelationMutation';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { SetActiveTemplateArgs } from '../resolvers/mutations/SetActiveTemplateMutation';
import { UpdateQuestionArgs } from '../resolvers/mutations/UpdateQuestionMutation';
import { UpdateQuestionTemplateRelationArgs } from '../resolvers/mutations/UpdateQuestionTemplateRelationMutation';
import { UpdateQuestionTemplateRelationSettingsArgs } from '../resolvers/mutations/UpdateQuestionTemplateRelationSettingsMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { UpdateTopicArgs } from '../resolvers/mutations/UpdateTopicMutation';
import { ConflictResolution } from '../resolvers/types/ConflictResolution';
import { TemplateExport } from './../models/Template';
@injectable()
export default class TemplateMutations {
  constructor(
    @inject(Tokens.TemplateDataSource) private dataSource: TemplateDataSource
  ) {}

  @ValidateArgs(createTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createTemplate(
    agent: UserWithRole | null,
    args: CreateTemplateArgs
  ): Promise<Template | Rejection> {
    const newTemplate = await this.dataSource.createTemplate(args);

    switch (args.groupId) {
      case TemplateGroupId.PROPOSAL:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New proposal',
          'proposal_basis'
        );
        break;
      case TemplateGroupId.SAMPLE:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New sample',
          'sample_basis'
        );
        break;
      case TemplateGroupId.GENERIC_TEMPLATE:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New Sub Topic',
          'generic_template_basis'
        );
        break;
      case TemplateGroupId.SHIPMENT:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New shipment',
          'shipment_basis'
        );
        break;
      case TemplateGroupId.VISIT_REGISTRATION:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New visit',
          'visit_basis'
        );
        break;
      case TemplateGroupId.PROPOSAL_ESI:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New experiment safety input',
          'proposal_esi_basis'
        );
        break;
      case TemplateGroupId.SAMPLE_ESI:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New experiment safety input',
          'sample_esi_basis'
        );
        break;
      case TemplateGroupId.FEEDBACK:
        await this.createInitialTopic(
          newTemplate.templateId,
          0,
          'New feedback',
          'feedback_basis'
        );
        break;
    }

    const activeTemplateTypes = [
      TemplateGroupId.SHIPMENT,
      TemplateGroupId.VISIT_REGISTRATION,
      TemplateGroupId.FEEDBACK,
    ];

    const currentActiveTemplateId = await this.dataSource.getActiveTemplateId(
      args.groupId
    );
    if (
      !currentActiveTemplateId &&
      activeTemplateTypes.includes(args.groupId)
    ) {
      // if there is no active template, then mark newly created template as active
      await this.dataSource.setActiveTemplate({
        templateGroupId: args.groupId,
        templateId: newTemplate.templateId,
      });
    }

    return newTemplate;
  }

  /** creates the first topic, so that the template is not empty to begin with */
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
        return rejection(
          'Missing question with firstQuestionId from the database',
          { firstQuestionId }
        );
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
      .then((result) => result);

    return result;
  }

  @ValidateArgs(deleteTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteTemplate(
    user: UserWithRole | null,
    { templateId }: { templateId: number }
  ): Promise<Template | Rejection> {
    return this.dataSource.deleteTemplate(templateId).catch((err) => {
      return rejection('Could not delete template', { templateId, user }, err);
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

    return this.dataSource.upsertTopics(dataToUpsert).catch((err) => {
      return rejection('Could not create topic', { user, args }, err);
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

    return this.dataSource.upsertTopics(dataToUpsert).catch((err) => {
      return rejection('Could not update topic', { agent, args }, err);
    });
  }

  @ValidateArgs(deleteTopicValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteTopic(
    agent: UserWithRole | null,
    { topicId }: { topicId: number }
  ): Promise<Topic | Rejection> {
    return this.dataSource.deleteTopic(topicId).catch((err) => {
      return rejection('Could not delete topic', { agent, topicId }, err);
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
      .catch((err) => {
        return rejection(
          'Could not create template field',
          { agent, dataType },
          err
        );
      });
  }

  @ValidateArgs(updateQuestionValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestion(
    agent: UserWithRole | null,
    args: UpdateQuestionArgs
  ): Promise<Question | Rejection> {
    return this.dataSource.updateQuestion(args.id, args).catch((err) => {
      return rejection('Could not update question', { agent, args }, err);
    });
  }

  @ValidateArgs(deleteQuestionValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteQuestion(
    agent: UserWithRole | null,
    { questionId }: { questionId: string }
  ): Promise<Question | Rejection> {
    return this.dataSource.deleteQuestion(questionId).catch((error) => {
      return rejection(
        'Could not delete question',
        { agent, id: questionId },
        error
      );
    });
  }

  async getQuestionsDataToUpsert(
    changingQuestionRel:
      | CreateQuestionTemplateRelationArgs
      | UpdateQuestionTemplateRelationArgs
  ) {
    const allOtherTopicQuestions =
      await this.dataSource.getQuestionTemplateRelations(
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
      .catch((err) => {
        return rejection('Could not update question rel', { agent, args }, err);
      });
  }

  @ValidateArgs(updateQuestionTemplateRelationValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateQuestionTemplateRelationSettings(
    agent: UserWithRole | null,
    args: UpdateQuestionTemplateRelationSettingsArgs
  ): Promise<Template | Rejection | null> {
    return this.dataSource
      .updateQuestionTemplateRelationSettings(args)
      .catch((error) => {
        return rejection(
          'Could not update question rel',
          { agent, args },
          error
        );
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
      .catch((error) => {
        return rejection(
          'Could not delete question rel',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(updateTemplateValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateTemplate(user: UserWithRole | null, args: UpdateTemplateArgs) {
    return this.dataSource.updateTemplate(args).catch((err) => {
      return rejection('Could not update topic order', { user }, err);
    });
  }

  @Authorized([Roles.USER_OFFICER])
  async setActiveTemplate(
    user: UserWithRole | null,
    args: SetActiveTemplateArgs
  ) {
    const template = await this.dataSource.getTemplate(args.templateId);

    if (template?.groupId !== args.templateGroupId) {
      return rejection('TemplateId and TemplateGroupId mismatch');
    }

    return this.dataSource.setActiveTemplate(args).catch((err: Error) => {
      return rejection('Could not set active template', { user }, err);
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
    } as CreateQuestionTemplateRelationArgs);

    return this.dataSource
      .upsertQuestionTemplateRelations(dataToUpsert)
      .catch((error) => {
        return rejection(
          'Could not create question rel',
          { agent, args },
          error
        );
      });
  }

  convertStringToTemplateExport = (string: string): TemplateExport => {
    const object: TemplateExport = JSON.parse(string);
    object.metadata.exportDate = new Date(object.metadata.exportDate);

    return object;
  };

  @Authorized([Roles.USER_OFFICER])
  async validateTemplateImport(
    agent: UserWithRole | null,
    templateAsJson: string
  ) {
    try {
      const templateExport = this.convertStringToTemplateExport(templateAsJson);

      const validation = await this.dataSource.validateTemplateExport(
        templateExport
      );

      return validation;
    } catch (error) {
      return rejection(
        `Could not validate template import. ${error}`,
        { agent, templateAsJson },
        error
      );
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async importTemplate(
    agent: UserWithRole | null,
    templateAsJson: string,
    conflictResolution: ConflictResolution[],
    subTemplatesConflictResolutions: ConflictResolution[][]
  ): Promise<Template | Rejection> {
    try {
      const templateExport: TemplateExport =
        this.convertStringToTemplateExport(templateAsJson);

      const template = await this.dataSource.importTemplate(
        templateExport,
        conflictResolution,
        subTemplatesConflictResolutions
      );

      const currentActiveTemplateId = await this.dataSource.getActiveTemplateId(
        template.groupId
      );
      if (!currentActiveTemplateId) {
        // if there is no active template, then mark newly created template as active
        await this.dataSource.setActiveTemplate({
          templateGroupId: template.groupId,
          templateId: template.templateId,
        });
      }

      return template;
    } catch (error) {
      return rejection(
        'Could not import template',
        { agent, templateAsJson },
        error
      );
    }
  }
}
