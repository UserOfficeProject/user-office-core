// TODO: Check if we can go only with camelcase.
// For now it is fine because of database fields.
/* eslint-disable @typescript-eslint/camelcase */
import { Proposal } from '../../models/Proposal';
import {
  ProposalTemplate,
  ProposalTemplateField,
  DataType,
  Topic,
  ProposalAnswer,
  TemplateStep,
  Questionary,
  ProposalTemplateMetadata,
} from '../../models/ProposalModel';
import {
  createDummyTemplate,
  createDummyField,
  createDummyTopic,
} from '../../tests/ProposalTestBed';
import { TemplateDataSource } from '../TemplateDataSource';
import { createDummyProposalTemplateMetadata } from './../../tests/ProposalTestBed';

export let dummyTemplate: ProposalTemplate;
export let dummyProposalTemplateMedatata: ProposalTemplateMetadata;
export let dummyQuestionary: Questionary;
export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;
export let dummyAnswers: ProposalAnswer[];

export class TemplateDataSourceMock implements TemplateDataSource {
  async createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplateMetadata> {
    return createDummyProposalTemplateMetadata({ name, description });
  }
  async deleteTemplate(id: number): Promise<ProposalTemplateMetadata> {
    return createDummyProposalTemplateMetadata({ id });
  }
  async getProposalTemplatesMetadata(
    isArchived: boolean
  ): Promise<ProposalTemplateMetadata[]> {
    return [
      new ProposalTemplateMetadata(
        1,
        'Industrial',
        'Industrial proposal template',
        isArchived
      ),
    ];
  }
  async isNaturalKeyPresent(naturalKey: string): Promise<boolean> {
    return true;
  }
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
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField> {
    return createDummyField({
      proposal_question_id: fieldId,
      natural_key: naturalKey,
      topic_id: topicId,
      data_type: dataType,
      question: question,
      config: JSON.parse(config || '{}'),
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
      natural_key?: string;
      data_type?: DataType;
      question?: string;
      topic?: number;
      config?: string;
      sort_order: number;
    }
  ): Promise<ProposalTemplate> {
    const template = await this.getProposalTemplate();
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
      values.title || 'Topic title',
      3,
      values.isEnabled !== undefined ? values.isEnabled : true
    );
  }

  async createTopic(sortOrder: number): Promise<ProposalTemplate> {
    dummyTemplate.steps.splice(
      sortOrder,
      0,
      new TemplateStep(new Topic(2, 'New Topic', sortOrder, false), [])
    );

    return dummyTemplate;
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
}
