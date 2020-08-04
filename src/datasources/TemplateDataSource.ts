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
} from '../models/Template';
import { CreateQuestionTemplateRelationArgs } from '../resolvers/mutations/CreateQuestionTemplateRelationMutation';
import { CreateTemplateArgs } from '../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateQuestionTemplateRelationArgs } from '../resolvers/mutations/UpdateQuestionTemplateRelationMutation';
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
  createQuestionTemplateRelation(
    args: CreateQuestionTemplateRelationArgs
  ): Promise<Template>;
  getQuestionTemplateRelation(
    questionId: string,
    templateId: number
  ): Promise<QuestionTemplateRelation | null>;

  updateQuestionTemplateRelation(
    args: UpdateQuestionTemplateRelationArgs
  ): Promise<Template>;

  deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template>;

  // Topic
  createTopic(args: CreateTopicArgs): Promise<Template>;
  updateTopic(
    topicId: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;

  updateTopicOrder(topicOrder: number[]): Promise<number[]>;

  isNaturalKeyPresent(naturalKey: string): Promise<boolean>;
}
