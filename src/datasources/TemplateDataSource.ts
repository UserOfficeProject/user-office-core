/* eslint-disable @typescript-eslint/camelcase */
import {
  ProposalTemplate,
  Topic,
  ProposalTemplateField,
  DataType,
  ProposalTemplateMetadata,
} from '../models/ProposalModel';
import { FieldDependencyInput } from './../resolvers/mutations/UpdateProposalTemplateFieldMutation';

export interface TemplateDataSource {
  createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplateMetadata>;
  getProposalTemplatesMetadata(
    isArchived?: boolean
  ): Promise<ProposalTemplateMetadata[]>;
  getProposalTemplate(): Promise<ProposalTemplate>;

  // TemplateField
  createTemplateField(
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField>;
  getTemplateField(fieldId: string): Promise<ProposalTemplateField | null>;
  updateTemplateField(
    proposal_question_id: string,
    values: {
      natural_key?: string;
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependencyInput[];
    }
  ): Promise<ProposalTemplate>;
  deleteTemplateField(fieldId: string): Promise<ProposalTemplate>;

  // Topic
  createTopic(sortOrder: number): Promise<ProposalTemplate>;
  updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic>;
  deleteTopic(id: number): Promise<Topic>;

  updateTopicOrder(topicOrder: number[]): Promise<number[]>;

  isNaturalKeyPresent(natural_key: string): Promise<boolean>;

  deleteTemplate(id: number): Promise<ProposalTemplateMetadata>;
}
