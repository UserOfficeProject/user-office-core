import {
  ProposalTemplate,
  Topic,
  ProposalTemplateField,
  FieldDependency,
  DataType
} from "../models/ProposalModel";

export interface TemplateDataSource {
  // Read
  getProposalTemplate(): Promise<ProposalTemplate>;

  // Write
  createTopic(sortOrder: number): Promise<ProposalTemplate>;
  updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean; sortOrder?: number }
  ): Promise<Topic | null>;
  deleteTopic(id: number): Promise<Topic | null>;

  createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField | null>;
  updateField(
    proposal_question_id: string,
    values: {
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependency[];
    }
  ): Promise<ProposalTemplate | null>;
  deleteTemplateField(fieldId: string): Promise<ProposalTemplate | null>;

  updateTopicOrder(topicOrder: number[]): Promise<Boolean | null>;
}
