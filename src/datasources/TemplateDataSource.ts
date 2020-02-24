import {
  ProposalTemplate,
  Topic,
  ProposalTemplateField,
  FieldDependency,
  DataType
} from "../models/ProposalModel";

export interface TemplateDataSource {
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
      dependencies?: FieldDependency[];
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
}
