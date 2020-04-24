/* eslint-disable @typescript-eslint/camelcase */
import {
  DataType,
  Question,
  Topic,
  TemplateStep,
  ProposalTemplate,
} from '../models/ProposalModel';
import { QuestionRel } from '../models/ProposalModel';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateProposalTemplateArgs as UpdateTemplateArgs } from '../resolvers/mutations/UpdateProposalTemplateMutation';
import { FieldDependencyInput } from '../resolvers/mutations/UpdateQuestionRelMutation';
import { ProposalTemplatesArgs } from '../resolvers/queries/ProposalTemplatesQuery';

export interface TemplateDataSource {
  // Template
  createTemplate(name: string, description?: string): Promise<ProposalTemplate>;
  getProposalTemplate(templateId: number): Promise<ProposalTemplate | null>;
  getProposalTemplates(
    args?: ProposalTemplatesArgs
  ): Promise<ProposalTemplate[]>;
  updateTemplate(values: UpdateTemplateArgs): Promise<ProposalTemplate | null>;
  deleteTemplate(id: number): Promise<ProposalTemplate>;
  cloneTemplate(templateId: number): Promise<ProposalTemplate>;
  getProposalTemplateSteps(templateId: number): Promise<TemplateStep[]>;
  // TemplateField
  createQuestion(
    fieldId: string,
    naturalKey: string,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<Question>;

  getQuestion(fieldId: string): Promise<Question | null>;
  updateQuestion(
    questionId: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      config?: string;
    }
  ): Promise<Question>;
  deleteQuestion(fieldId: string): Promise<Question>;

  // TemplateField rel
  createQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<TemplateStep[]>;

  getQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<QuestionRel | null>;

  updateQuestionRel(
    questionId: string,
    templateId: number,
    values: {
      topicId?: number;
      sortOrder?: number;
      dependency?: FieldDependencyInput;
    }
  ): Promise<TemplateStep[]>;

  deleteQuestionRel(args: DeleteQuestionRelArgs): Promise<TemplateStep[]>;

  createQuestionAndRel(
    templateId: number,
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<TemplateStep[]>;

  // Topic
  createTopic(args: CreateTopicArgs): Promise<TemplateStep[]>;
  updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;

  updateTopicOrder(topicOrder: number[]): Promise<number[]>;

  isNaturalKeyPresent(natural_key: string): Promise<boolean>;
}
