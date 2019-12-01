import {
  ProposalTemplate,
  ProposalTemplateField,
  DataType,
  Topic,
  ProposalAnswer,
  TemplateStep,
  Questionary
} from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import {
  createDummyTemplate,
  createDummyField,
  createDummyTopic
} from "../../tests/ProposalTestBed";
import { TemplateDataSource } from "../TemplateDataSource";

export var dummyTemplate: ProposalTemplate;
export var dummyQuestionary: Questionary;
export var dummyProposal: Proposal;
export var dummyProposalSubmitted: Proposal;
export var dummyAnswers: ProposalAnswer[];

export class templateDataSource implements TemplateDataSource {
  public init() {
    dummyTemplate = createDummyTemplate();
  }

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    return topicOrder;
  }
  async deleteTopic(id: number): Promise<Topic> {
    return createDummyTopic(id, {});
  }
  async createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField> {
    return createDummyField({
      proposal_question_id: fieldId,
      topic_id: topicId,
      data_type: dataType,
      question: question,
      config: JSON.parse(config || "{}")
    });
  }

  async getTemplateField(
    fieldId: string
  ): Promise<ProposalTemplateField | null> {
    return createDummyField({ proposal_question_id: fieldId });
  }

  async deleteTemplateField(fieldId: string): Promise<ProposalTemplate> {
    return this.getProposalTemplate();
  }
  async updateTemplateField(
    proposal_question_id: string,
    values: {
      data_type?: DataType | undefined;
      question?: string | undefined;
      topic?: number | undefined;
      config?: string | undefined;
      sort_order: number;
    }
  ): Promise<ProposalTemplate> {
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
    dummyTemplate.steps.splice(
      sortOrder,
      0,
      new TemplateStep(new Topic(2, "New Topic", sortOrder, false), [])
    );
    return dummyTemplate;
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
}
