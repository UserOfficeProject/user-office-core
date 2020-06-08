/* eslint-disable @typescript-eslint/camelcase */
import {
  DataType,
  Template,
  Question,
  QuestionRel,
  TemplateStep,
  Topic,
} from '../models/ProposalModel';
import { CreateQuestionRelArgs } from '../resolvers/mutations/CreateQuestionRelMutation';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateTemplateArgs } from '../resolvers/mutations/UpdateTemplateMutation';
import { UpdateQuestionRelArgs } from '../resolvers/mutations/UpdateQuestionRelMutation';
import { TemplatesArgs } from '../resolvers/queries/TemplatesQuery';

export interface TemplateDataSource {
  // Template
  createTemplate(name: string, description?: string): Promise<Template>;
  getTemplate(templateId: number): Promise<Template | null>;
  getTemplates(args?: TemplatesArgs): Promise<Template[]>;
  updateTemplate(values: UpdateTemplateArgs): Promise<Template | null>;
  deleteTemplate(id: number): Promise<Template>;
  cloneTemplate(templateId: number): Promise<Template>;
  getTemplateSteps(templateId: number): Promise<TemplateStep[]>;
  // TemplateField
  createQuestion(
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
  createQuestionRel(args: CreateQuestionRelArgs): Promise<Template>;
  getQuestionRel(
    questionId: string,
    templateId: number
  ): Promise<QuestionRel | null>;

  updateQuestionRel(args: UpdateQuestionRelArgs): Promise<Template>;

  deleteQuestionRel(args: DeleteQuestionRelArgs): Promise<Template>;

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
