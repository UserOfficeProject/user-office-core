import { EvaluatorOperator } from '../../models/ConditionEvaluator';
// TODO: Check if we can go only with camelcase.
// For now it is fine because of database fields.
/* eslint-disable @typescript-eslint/camelcase */
import { Proposal } from '../../models/Proposal';
import {
  Answer,
  DataType,
  FieldCondition,
  FieldDependency,
  ProposalTemplate,
  ProposalTemplateMetadata,
  Question,
  Questionary,
  QuestionRel,
  TemplateStep,
  Topic,
} from '../../models/ProposalModel';
import { UpdateProposalTemplateMetadataArgs } from '../../resolvers/mutations/UpdateProposalTemplateMetadataMutation';
import { TemplateDataSource } from '../TemplateDataSource';

export let dummyTemplate: ProposalTemplate;
export let dummyProposalTemplateMedatata: ProposalTemplateMetadata;
export let dummyQuestionary: Questionary;
export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;
export let dummyAnswers: Answer[];

const createDummyQuestion = (values?: Partial<Question>): Question => {
  return new Question(
    values?.proposalQuestionId || 'random_field_name_' + Math.random(),
    values?.naturalKey || 'is_dangerous',
    values?.dataType || DataType.TEXT_INPUT,
    values?.question || 'Some random question',
    values?.config || { required: false, tooltip: '', small_label: '' }
  );
};

const create1TopicFieldlessTemplate = () => {
  return new ProposalTemplate([
    new TemplateStep(new Topic(0, 'General information', 0, true), []),
  ]);
};

const createDummyQuestionRel = (values: {
  question?: Partial<Question>;
  sortOrder?: number;
  topicId?: number;
  dependency?: FieldDependency;
}): QuestionRel => {
  return new QuestionRel(
    createDummyQuestion(values.question),
    values.sortOrder || Math.round(Math.random() * 100),
    values.topicId || Math.round(Math.random() * 10),
    values.dependency || undefined
  );
};

const createDummyTemplate = () => {
  const hasLinksToField = createDummyQuestionRel({
    question: createDummyQuestion({
      proposalQuestionId: 'hasLinksToField',
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }),
  });
  const linksToField = createDummyQuestionRel({
    question: createDummyQuestion({
      proposalQuestionId: 'linksToField',
      dataType: DataType.TEXT_INPUT,
    }),
    dependency: new FieldDependency(
      'linksToField',
      'hasLinksToField',
      'hasLinksToField',
      new FieldCondition(EvaluatorOperator.EQ, 'yes')
    ),
  });

  return new ProposalTemplate([
    new TemplateStep(new Topic(1, 'General information', 1, true), [
      hasLinksToField,
      linksToField,
    ]),
  ]);
};

const createDummyProposalTemplateMetadata = (values?: {
  id?: number;
  name?: string;
  description?: string;
  isArchived?: boolean;
}) => {
  values = values || {};

  return new ProposalTemplateMetadata(
    values.id || 1,
    values.name || 'Industrial template',
    values.description || 'Industrial template description',
    values.isArchived || false
  );
};

const createDummyTopic = (
  id: number,
  values: {
    title?: string;
    sortOrder?: number;
    isEnabled?: boolean;
  }
) => {
  return new Topic(
    id,
    values.title || 'General information',
    values.sortOrder || 0,
    values.isEnabled || true
  );
};

export class TemplateDataSourceMock implements TemplateDataSource {
  async cloneTemplate(templateId: number): Promise<ProposalTemplateMetadata> {
    return createDummyProposalTemplateMetadata({ id: templateId });
  }
  async getProposalTemplateMetadata(
    templateId: number
  ): Promise<ProposalTemplateMetadata | null> {
    return createDummyProposalTemplateMetadata({ id: templateId });
  }
  async updateTemplateMetadata(
    values: UpdateProposalTemplateMetadataArgs
  ): Promise<ProposalTemplateMetadata | null> {
    return createDummyProposalTemplateMetadata(values);
  }
  async createQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
  async getQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<QuestionRel | null> {
    return createDummyQuestionRel({
      question: { proposalQuestionId: fieldId },
    });
  }
  async deleteQuestionRel(
    templateId: number,
    fieldId: string
  ): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
  async createQuestionAndRel(
    templateId: number,
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
  async updateQuestionRel(
    questionId: string,
    templateId: number,
    values: {
      topicId?: number | undefined;
      sortOrder?: number | undefined;
      dependency?: any;
    }
  ): Promise<ProposalTemplate> {
    return createDummyTemplate();
  }
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
    isArchived?: boolean
  ): Promise<ProposalTemplateMetadata[]> {
    return [
      new ProposalTemplateMetadata(
        1,
        'Industrial',
        'Industrial proposal template',
        isArchived || false
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
  async createQuestion(
    fieldId: string,
    naturalKey: string,
    dataType: DataType,
    question: string
  ): Promise<Question> {
    return createDummyQuestion({
      naturalKey: naturalKey,
      dataType: dataType,
      proposalQuestionId: fieldId,
      question,
    });
  }

  async getQuestion(fieldId: string): Promise<Question | null> {
    return createDummyQuestion({ proposalQuestionId: fieldId });
  }

  async deleteQuestion(fieldId: string): Promise<Question> {
    return createDummyQuestion({ proposalQuestionId: fieldId });
  }
  async updateQuestion(
    questionId: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      config?: string;
    }
  ): Promise<Question> {
    const template = await this.getProposalTemplate();
    template.steps.forEach(topic => {
      topic.fields!.forEach(field => {
        if (field.question.proposalQuestionId === questionId) {
          Object.assign(field, values);

          return field.question;
        }
      });
    });

    throw new Error('Not found');
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
