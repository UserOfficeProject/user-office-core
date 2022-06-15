import {
  DataType,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  TemplateCategoryId,
  TemplateGroupId,
  TemplateValidation,
  TemplatesHasQuestions,
  TemplateStep,
  Topic,
} from '../models/Template';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { SetActiveTemplateArgs } from '../resolvers/mutations/SetActiveTemplateMutation';
import { UpdateQuestionTemplateRelationSettingsArgs } from '../resolvers/mutations/UpdateQuestionTemplateRelationSettingsMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { QuestionsFilter } from '../resolvers/queries/QuestionsQuery';
import { TemplatesArgs } from '../resolvers/queries/TemplatesQuery';
import { ConflictResolution } from '../resolvers/types/ConflictResolution';
import { TemplateGroup } from '../resolvers/types/TemplateGroup';
import { TemplateExport } from './../models/Template';

export interface TemplateDataSource {
  getTemplateCategories(): Promise<TemplateCategory[]>;
  // Template
  createTemplate(args: CreateTemplateArgs): Promise<Template>;
  getTemplate(templateId: number): Promise<Template | null>;
  getTemplateExport(templateId: number): Promise<TemplateExport>;
  getTemplates(args?: TemplatesArgs): Promise<Template[]>;
  updateTemplate(values: UpdateTemplateArgs): Promise<Template | null>;
  deleteTemplate(id: number): Promise<Template>;
  cloneTemplate(templateId: number): Promise<Template>;
  getTemplateSteps(templateId: number): Promise<TemplateStep[]>;
  setActiveTemplate(args: SetActiveTemplateArgs): Promise<boolean>;
  importTemplate(
    templateExport: TemplateExport,
    conflictResolutions: ConflictResolution[],
    subTemplatesConflictResolutions: ConflictResolution[][]
  ): Promise<Template>;
  // TemplateField
  createQuestion(
    categoryId: TemplateCategoryId,
    questionId: string,
    naturalKey: string,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<Question>;

  getQuestion(questionId: string): Promise<Question | null>;
  getQuestionByNaturalKey(naturalKey: string): Promise<Question | null>;
  updateQuestion(
    questionId: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      config?: string;
    }
  ): Promise<Question>;
  deleteQuestion(questionId: string): Promise<Question>;
  getComplementaryQuestions(templateId: number): Promise<Question[] | null>;
  getQuestions(filter?: QuestionsFilter): Promise<Question[]>;
  getQuestionsInTemplate(templateId: number): Promise<Question[]>;

  // TemplateField rel
  getQuestionTemplateRelation(
    questionId: string,
    templateId: number
  ): Promise<QuestionTemplateRelation | null>;
  getQuestionTemplateRelations(
    templateId: number,
    topicId: number,
    questionToExcludeId?: string
  ): Promise<TemplatesHasQuestions[] | null>;

  upsertQuestionTemplateRelations(
    collection: TemplatesHasQuestions[]
  ): Promise<Template>;

  updateQuestionTemplateRelationSettings(
    args: UpdateQuestionTemplateRelationSettingsArgs
  ): Promise<Template>;

  deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template>;

  // Topic
  getTopics(
    templateId: number,
    topicToExcludeId?: number
  ): Promise<Topic[] | null>;
  getActiveTemplateId(groupId: TemplateGroupId): Promise<number | null>;
  upsertTopics(data: Topic[]): Promise<Template>;
  createTopic(args: CreateTopicArgs): Promise<Topic>;
  updateTopicTitle(topicId: number, title: string): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;
  isNaturalKeyPresent(naturalKey: string): Promise<boolean>;
  getGroup(groupId: TemplateGroupId): Promise<TemplateGroup>;
  validateTemplateExport(template: TemplateExport): Promise<TemplateValidation>;
}
