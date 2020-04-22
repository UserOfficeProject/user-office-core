/* eslint-disable @typescript-eslint/camelcase */
import {
  DataType,
  ProposalTemplate,
  ProposalTemplateMetadata,
  Question,
  Topic,
} from '../models/ProposalModel';
import { QuestionRel } from '../models/ProposalModel';
import { CreateTopicArgs } from '../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateProposalTemplateMetadataArgs } from '../resolvers/mutations/UpdateProposalTemplateMetadataMutation';
import { FieldDependencyInput } from '../resolvers/mutations/UpdateQuestionRelMutation';

export interface ProposalAdminDataSource {
  // Template
  createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplateMetadata>;
  cloneTemplate(templateId: number): Promise<ProposalTemplateMetadata>;
  getProposalTemplatesMetadata(
    isArchived?: boolean
  ): Promise<ProposalTemplateMetadata[]>;
  getProposalTemplateMetadata(
    templateId: number
  ): Promise<ProposalTemplateMetadata | null>;
  getProposalTemplate(templateId: number): Promise<ProposalTemplate>;
  updateTemplateMetadata(
    values: UpdateProposalTemplateMetadataArgs
  ): Promise<ProposalTemplateMetadata | null>;

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
  ): Promise<ProposalTemplate>;

  getQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<QuestionRel | null>;

  deleteQuestionRel(args: DeleteQuestionRelArgs): Promise<ProposalTemplate>;

  createQuestionAndRel(
    templateId: number,
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplate>;

  updateQuestionRel(
    questionId: string,
    templateId: number,
    values: {
      topicId?: number;
      sortOrder?: number;
      dependency?: FieldDependencyInput;
    }
  ): Promise<ProposalTemplate>;

  // Topic
  createTopic(args: CreateTopicArgs): Promise<ProposalTemplate>;
  updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;

  updateTopicOrder(topicOrder: number[]): Promise<number[]>;

  isNaturalKeyPresent(natural_key: string): Promise<boolean>;

  deleteTemplate(id: number): Promise<ProposalTemplateMetadata>;
}
