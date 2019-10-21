import { ProposalDataSource } from "../ProposalDataSource";
import {
  Proposal,
  ProposalTemplate,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  Topic,
  ProposalAnswer,
  FieldConfig,
  TemplateStep,
  FieldCondition
} from "../../models/Proposal";
import { Review } from "../../models/Review";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";

const createDummyTemplate = () => {
  const hasLinksToField = createDummyField({
    proposal_question_id: "hasLinksToField",
    data_type: DataType.SELECTION_FROM_OPTIONS
  });
  const linksToField = createDummyField({
    proposal_question_id: "linksToField",
    data_type: DataType.TEXT_INPUT,
    dependencies: [
      new FieldDependency(
        "linksToField",
        "hasLinksToField",
        new FieldCondition(EvaluatorOperator.EQ, "yes")
      )
    ]
  });

  return new ProposalTemplate([
    new TemplateStep(new Topic(1, "General information", 1, true), [
      hasLinksToField,
      linksToField
    ])
  ]);
};

const newTemplate = createDummyTemplate();

export const dummyProposal = new Proposal(
  1,
  "title",
  "abstract",
  1, // main proposer
  0, // status
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyProposalSubmitted = new Proposal(
  2,
  "submitted proposal",
  "abstract",
  1, // main proposer
  1, // status
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyAnswers: Array<ProposalAnswer> = [
  {
    proposal_question_id: "has_references",
    data_type: DataType.BOOLEAN,
    value: "true"
  },
  {
    proposal_question_id: "fasta_seq",
    data_type: DataType.TEXT_INPUT,
    value: "ADQLTEEQIAEFKEAFSLFDKDGDGTITTKELG*"
  }
];

function createDummyField(values: {
  data_type?: DataType;
  proposal_question_id?: string;
  sort_order?: number;
  topic_id?: number;
  question?: string;
  config?: FieldConfig;
  dependencies?: FieldDependency[];
}): ProposalTemplateField {
  return new ProposalTemplateField(
    values.proposal_question_id || "random_field_name_" + Math.random(),
    values.data_type || DataType.TEXT_INPUT,
    values.sort_order || Math.round(Math.random() * 100),
    values.question || "Some random question",
    (values.config && JSON.stringify(values.config)) || "{}",
    values.topic_id || Math.round(Math.random() * 10),
    values.dependencies || []
  );
}

export class proposalDataSource implements ProposalDataSource {
  updateTopicCompletenesses(
    id: number,
    topicsCompleted: number[]
  ): Promise<Boolean | null> {
    throw new Error("Method not implemented.");
  }
  async updateTopicOrder(topicOrder: number[]): Promise<Boolean | null> {
    return true;
  }
  async deleteTopic(id: number): Promise<Boolean | null> {
    return true;
  }
  async createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField | null> {
    return createDummyField({
      proposal_question_id: fieldId,
      topic_id: topicId,
      data_type: dataType,
      question: question,
      config: JSON.parse(config || "{}")
    });
  }
  async deleteTemplateField(fieldId: string): Promise<ProposalTemplate | null> {
    return this.getProposalTemplate();
  }
  async updateField(
    proposal_question_id: string,
    values: {
      data_type?: DataType | undefined;
      question?: string | undefined;
      topic?: number | undefined;
      config?: string | undefined;
      sort_order: number;
    }
  ): Promise<ProposalTemplate | null> {
    var template = await this.getProposalTemplate();
    template.steps.forEach(topic => {
      topic.fields!.forEach(field => {
        if (field.proposal_question_id === proposal_question_id) {
          Object.assign(field, values);
        }
      });
    });

    return template;
  }

  async updateTopic(
    id: number,
    values: { title?: string; isEnabled?: boolean }
  ): Promise<Topic> {
    return new Topic(
      id,
      values.title || "Topic title",
      3,
      values.isEnabled !== undefined ? values.isEnabled : true
    );
  }

  async createTopic(sortOrder: number): Promise<ProposalTemplate> {
    newTemplate.steps.splice(
      sortOrder,
      0,
      new TemplateStep(new Topic(2, "New Topic", sortOrder, false), [])
    );
    return newTemplate;
  }
  async getProposalAnswers(proposalId: number): Promise<ProposalAnswer[]> {
    return dummyAnswers;
  }
  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }
  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<Boolean> {
    return true;
  }

  async updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<Boolean> {
    return true;
  }
  async checkActiveCall(): Promise<Boolean> {
    return true;
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }

  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null> {
    throw new Error("Method not implemented.");
  }
  async rejectProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }
  async update(proposal: Proposal): Promise<Proposal | null> {
    if (proposal.id && proposal.id > 0) {
      if (proposal.id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    return null;
  }
  async setProposalUsers(id: number, users: number[]): Promise<Boolean> {
    return true;
  }
  async acceptProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }

  async submitProposal(id: number): Promise<Proposal | null> {
    if (id && id > 0) {
      return dummyProposal;
    }
    return null;
  }

  async get(id: number) {
    if (id && id > 0) {
      if (id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    return null;
  }

  async create(proposerID: number) {
    return dummyProposal;
  }

  async getProposals(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: 1, proposals: [dummyProposal] };
  }

  async getUserProposals(id: number) {
    return [dummyProposal];
  }
}
