/* eslint-disable @typescript-eslint/camelcase */
import {
  DataType,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  TemplateStep,
  Topic,
  TemplateCategoryId,
  TemplatesHasQuestions,
} from '../models/Template';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { TemplatesArgs } from '../resolvers/queries/TemplatesQuery';

export interface TemplateDataSource {
  getTemplateCategories(): Promise<TemplateCategory[]>;
  // Template
  createTemplate(args: CreateTemplateArgs): Promise<Template>;
  getTemplate(templateId: number): Promise<Template | null>;
  getTemplates(args?: TemplatesArgs): Promise<Template[]>;
  updateTemplate(values: UpdateTemplateArgs): Promise<Template | null>;
  deleteTemplate(id: number): Promise<Template>;
  cloneTemplate(templateId: number): Promise<Template>;
  getTemplateSteps(templateId: number): Promise<TemplateStep[]>;
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

  deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template>;

  // Topic
  getTopics(
    templateId: number,
    topicToExcludeId?: number
  ): Promise<Topic[] | null>;
  upsertTopics(data: Topic[]): Promise<Template>;
  createTopic(args: CreateTopicArgs): Promise<Topic>;
  updateTopicTitle(topicId: number, title: string): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;

  isNaturalKeyPresent(naturalKey: string): Promise<boolean>;
}
