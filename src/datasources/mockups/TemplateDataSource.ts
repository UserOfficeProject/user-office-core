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
  Question,
  Questionary,
  QuestionRel,
  TemplateStep,
  Topic,
} from '../../models/ProposalModel';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateProposalTemplateArgs } from '../../resolvers/mutations/UpdateProposalTemplateMutation';
import { ProposalTemplatesArgs } from '../../resolvers/queries/ProposalTemplatesQuery';
import { TemplateDataSource } from '../TemplateDataSource';

export let dummyTemplateSteps: TemplateStep[];
export let dummyProposalTemplate: ProposalTemplate;
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

const createDummyTemplateSteps = () => {
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

  return [
    new TemplateStep(new Topic(1, 'General information', 1, true), [
      hasLinksToField,
      linksToField,
    ]),
  ];
};

const createDummyProposalTemplate = (values?: {
  id?: number;
  name?: string;
  description?: string;
  isArchived?: boolean;
}) => {
  values = values || {};

  return new ProposalTemplate(
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
  async cloneTemplate(templateId: number): Promise<ProposalTemplate> {
    return createDummyProposalTemplate({ id: templateId });
  }
  async getProposalTemplate(
    templateId: number
  ): Promise<ProposalTemplate | null> {
    return createDummyProposalTemplate({ id: templateId });
  }
  async updateTemplate(
    values: UpdateProposalTemplateArgs
  ): Promise<ProposalTemplate | null> {
    return createDummyProposalTemplate(values);
  }
  async createQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<TemplateStep[]> {
    return createDummyTemplateSteps();
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
    args: DeleteQuestionRelArgs
  ): Promise<TemplateStep[]> {
    return createDummyTemplateSteps();
  }
  async createQuestionAndRel(
    templateId: number,
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<TemplateStep[]> {
    return createDummyTemplateSteps();
  }
  async updateQuestionRel(
    questionId: string,
    templateId: number,
    values: {
      topicId?: number | undefined;
      sortOrder?: number | undefined;
      dependency?: any;
    }
  ): Promise<TemplateStep[]> {
    return createDummyTemplateSteps();
  }
  async createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplate> {
    return createDummyProposalTemplate({ name, description });
  }
  async deleteTemplate(id: number): Promise<ProposalTemplate> {
    return createDummyProposalTemplate({ id });
  }
  async getProposalTemplates(
    args?: ProposalTemplatesArgs
  ): Promise<ProposalTemplate[]> {
    return [
      new ProposalTemplate(
        1,
        'Industrial',
        'Industrial proposal template',
        args?.filter?.isArchived || false
      ),
    ];
  }
  async isNaturalKeyPresent(naturalKey: string): Promise<boolean> {
    return true;
  }
  public init() {
    dummyTemplateSteps = createDummyTemplateSteps();
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
    const steps = await this.getProposalTemplateSteps();
    steps.forEach(topic => {
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

  async createTopic(args: CreateTopicArgs): Promise<TemplateStep[]> {
    dummyTemplateSteps.splice(
      args.sortOrder,
      0,
      new TemplateStep(new Topic(2, 'New Topic', args.sortOrder, false), [])
    );

    return dummyTemplateSteps;
  }

  async getProposalTemplateSteps(): Promise<TemplateStep[]> {
    return createDummyTemplateSteps();
  }
}
