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
import { getFieldById } from '../../models/ProposalModelFunctions';
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
      proposalQuestionId: 'has_links_to_field',
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }),
  });
  const linksToField = createDummyQuestionRel({
    question: createDummyQuestion({
      proposalQuestionId: 'links_to_field',
      dataType: DataType.TEXT_INPUT,
    }),
    dependency: new FieldDependency(
      'links_to_field',
      'has_links_to_field',
      'has_links_to_field',
      new FieldCondition(EvaluatorOperator.eq, 'yes')
    ),
  });

  const enableCrystallization = createDummyQuestionRel({
    question: createDummyQuestion({
      proposalQuestionId: 'enable_crystallization',
      dataType: DataType.BOOLEAN,
      question: 'Is crystallization aplicable',
      naturalKey: 'enable_crystallization',
    }),
  });

  const hasLinksWithIndustry = createDummyQuestionRel({
    question: createDummyQuestion({
      proposalQuestionId: 'has_links_with_industry',
      dataType: DataType.BOOLEAN,
      question: 'Has links with industry',
      naturalKey: 'has_links_with_industry',
    }),
  });

  return [
    new TemplateStep(new Topic(1, 'General information', 1, true), [
      hasLinksToField,
      linksToField,
      hasLinksWithIndustry,
      enableCrystallization,
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
    return createDummyProposalTemplate({ id: 2 });
  }
  async getProposalTemplate(
    templateId: number
  ): Promise<ProposalTemplate | null> {
    return dummyProposalTemplate;
  }
  async updateTemplate(
    values: UpdateProposalTemplateArgs
  ): Promise<ProposalTemplate | null> {
    dummyProposalTemplate = { ...dummyProposalTemplate, ...values };

    return dummyProposalTemplate;
  }
  async createQuestionRel(
    questionId: string,
    templateId: number
  ): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
  }
  async getQuestionRel(
    questionId: string,
    templateId: number
  ): Promise<QuestionRel | null> {
    return createDummyQuestionRel({
      question: { proposalQuestionId: questionId },
    });
  }
  async deleteQuestionRel(
    args: DeleteQuestionRelArgs
  ): Promise<ProposalTemplate> {
    dummyTemplateSteps.forEach(function(step) {
      step.fields = step.fields.filter(field => {
        return field.question.proposalQuestionId !== args.questionId;
      });
    });

    return dummyProposalTemplate;
  }
  async createQuestionAndRel(
    templateId: number,
    questionId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
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
    const question = getFieldById(
      dummyTemplateSteps,
      questionId
    ) as QuestionRel;
    question.dependency = values.dependency || question.dependency;
    question.sortOrder = values.sortOrder || question.sortOrder;
    question.topicId = values.topicId || question.topicId;

    return dummyProposalTemplate;
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
    dummyProposalTemplate = createDummyProposalTemplate();
  }

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    return topicOrder;
  }
  async deleteTopic(id: number): Promise<Topic> {
    return createDummyTopic(id, {});
  }
  async createQuestion(
    questionId: string,
    naturalKey: string,
    dataType: DataType,
    question: string
  ): Promise<Question> {
    return createDummyQuestion({
      naturalKey: naturalKey,
      dataType: dataType,
      proposalQuestionId: questionId,
      question,
    });
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    return createDummyQuestion({ proposalQuestionId: questionId });
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    return createDummyQuestion({ proposalQuestionId: questionId });
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
          console.log(field);
          Object.assign(field, values);

          return field.question;
        }
      });
    });

    throw new Error('Not found');
  }

  async updateTopic(
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ): Promise<Topic> {
    return new Topic(
      topicId,
      values.title || 'Topic title',
      3,
      values.isEnabled !== undefined ? values.isEnabled : true
    );
  }

  async createTopic(args: CreateTopicArgs): Promise<ProposalTemplate> {
    dummyTemplateSteps.splice(
      args.sortOrder,
      0,
      new TemplateStep(new Topic(2, 'New Topic', args.sortOrder, false), [])
    );

    return dummyProposalTemplate;
  }

  async getProposalTemplateSteps(): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
  }
}
