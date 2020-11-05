import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { getFieldById } from '../../models/ProposalModelFunctions';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  Template,
  TemplateCategory,
  TemplateCategoryId,
  TemplateStep,
  Topic,
  QuestionTemplateRelation,
} from '../../models/Template';
import { CreateQuestionTemplateRelationArgs } from '../../resolvers/mutations/CreateQuestionTemplateRelationMutation';
import { CreateTemplateArgs } from '../../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateQuestionTemplateRelationArgs } from '../../resolvers/mutations/UpdateQuestionTemplateRelationMutation';
import { UpdateTemplateArgs } from '../../resolvers/mutations/UpdateTemplateMutation';
import { TemplatesArgs } from '../../resolvers/queries/TemplatesQuery';
import { logger } from '../../utils/Logger';
import { TemplateDataSource } from '../TemplateDataSource';
import {
  dummyQuestionFactory,
  dummyQuestionTemplateRelationFactory,
} from './QuestionaryDataSource';

export let dummyProposalTemplate: Template;
export let dummyTemplateSteps: TemplateStep[];
export let dummyComplementarySteps: Question[];

const dummyProposalTemplateFactory = (values?: Partial<Template>) => {
  return new Template(
    values?.templateId || 1,
    values?.categoryId || 1,
    values?.name || 'Industrial template',
    values?.description || 'Industrial template description',
    values?.isArchived || false
  );
};

const dummyTopicFactory = (values?: Partial<Topic>) => {
  return new Topic(
    values?.id || 1,
    values?.title || 'General information',
    values?.templateId || 1,
    values?.sortOrder || 0,
    values?.isEnabled || true
  );
};

const dummyTemplateStepsFactory = () => {
  const hasLinksToField = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'has_links_to_field',
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }),
  });
  const linksToField = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
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

  const enableCrystallization = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'enable_crystallization',
      dataType: DataType.BOOLEAN,
      question: 'Is crystallization aplicable',
      naturalKey: 'enable_crystallization',
    }),
  });

  const hasLinksWithIndustry = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'has_links_with_industry',
      dataType: DataType.BOOLEAN,
      question: 'Has links with industry',
      naturalKey: 'has_links_with_industry',
    }),
  });

  const proposalBasis = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'proposal_basis',
      naturalKey: 'proposal_basis',
      dataType: DataType.PROPOSAL_BASIS,
    }),
  });

  return [
    new TemplateStep(new Topic(1, 'General information', 1, 1, true), [
      hasLinksToField,
      linksToField,
      hasLinksWithIndustry,
      enableCrystallization,
      proposalBasis,
    ]),
  ];
};

export class TemplateDataSourceMock implements TemplateDataSource {
  public init() {
    dummyProposalTemplate = dummyProposalTemplateFactory();
    dummyTemplateSteps = dummyTemplateStepsFactory();
    dummyComplementarySteps = [
      dummyQuestionFactory({
        proposalQuestionId: 'not_in_template',
        naturalKey: 'not_in_template',
      }),
    ];
  }

  async getComplementaryQuestions(
    templateId: number
  ): Promise<Question[] | null> {
    return [dummyQuestionFactory()];
  }
  async cloneTemplate(templateId: number): Promise<Template> {
    return dummyProposalTemplateFactory({ templateId: templateId + 1 });
  }
  async getTemplate(templateId: number): Promise<Template | null> {
    return dummyProposalTemplate;
  }
  async updateTemplate(values: UpdateTemplateArgs): Promise<Template | null> {
    dummyProposalTemplate = { ...dummyProposalTemplate, ...values };

    return dummyProposalTemplate;
  }
  async createQuestionTemplateRelation(
    args: CreateQuestionTemplateRelationArgs
  ): Promise<Template> {
    return dummyProposalTemplate;
  }
  async getQuestionTemplateRelation(
    questionId: string,
    templateId: number
  ): Promise<QuestionTemplateRelation | null> {
    return dummyQuestionTemplateRelationFactory({
      question: { proposalQuestionId: questionId },
    });
  }
  async deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template> {
    dummyTemplateSteps.forEach(function(step) {
      step.fields = step.fields.filter(field => {
        return field.question.proposalQuestionId !== args.questionId;
      });
    });

    return dummyProposalTemplate;
  }
  async updateQuestionTemplateRelation(
    args: UpdateQuestionTemplateRelationArgs
  ): Promise<Template> {
    const question = getFieldById(
      dummyTemplateSteps,
      args.questionId
    ) as QuestionTemplateRelation;
    question.sortOrder = args.sortOrder || 0;
    question.topicId = args.topicId || 1;

    return dummyProposalTemplate;
  }
  async createTemplate(args: CreateTemplateArgs): Promise<Template> {
    dummyProposalTemplate = dummyProposalTemplateFactory({ ...args });

    return dummyProposalTemplate;
  }
  async deleteTemplate(templateId: number): Promise<Template> {
    if (dummyProposalTemplate.templateId !== templateId) {
      throw new Error(`Template with ID ${templateId} does not exist`);
    }

    const copyOfTemplate = dummyProposalTemplateFactory(dummyProposalTemplate);
    dummyProposalTemplate.templateId = 999; // mocking deleting template with ID

    return copyOfTemplate;
  }

  async getTemplates(args?: TemplatesArgs): Promise<Template[]> {
    return [
      new Template(
        1,
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

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    return topicOrder;
  }
  async deleteTopic(id: number): Promise<Topic> {
    return dummyTopicFactory({ id });
  }
  async createQuestion(
    categoryId: TemplateCategoryId,
    questionId: string,
    naturalKey: string,
    dataType: DataType,
    question: string
  ): Promise<Question> {
    return dummyQuestionFactory({
      naturalKey: naturalKey,
      dataType: dataType,
      proposalQuestionId: questionId,
      question,
    });
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    const steps = await this.getTemplateSteps();
    const allQuestions = steps.reduce((accumulated, current) => {
      return accumulated.concat(current.fields.map(field => field.question));
    }, new Array<Question>());
    const question = allQuestions.find(
      question => question.proposalQuestionId === questionId
    );
    if (!question) {
      throw new Error(`Question ${questionId} does not exist`);
    }

    return question;
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} does not exist`);
    }
    const copy = dummyQuestionFactory(question);
    question.proposalQuestionId = 'deleted_question'; //works for mocking purposes

    return copy;
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
    const steps = await this.getTemplateSteps();
    const allQuestions = steps.reduce((accumulated, current) => {
      return accumulated.concat(current.fields);
    }, new Array<QuestionTemplateRelation>());
    const questionTemplateRelation = allQuestions.find(
      curQuestion => curQuestion.question.proposalQuestionId === questionId
    );

    if (questionTemplateRelation) {
      const { question } = questionTemplateRelation;
      Object.assign(question, values);

      return question;
    } else {
      throw new Error('Not found');
    }
  }

  async updateTopic(
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ): Promise<Topic> {
    const steps = await this.getTemplateSteps();
    const allTopics = steps.reduce((accumulated, current) => {
      return accumulated.concat(current.topic);
    }, new Array<Topic>());

    const topic = allTopics.find(topic => topic.id === topicId);

    if (!topic) {
      throw new Error('Topic not found');
    }
    Object.assign(topic, values);

    return topic;
  }

  async createTopic(args: CreateTopicArgs): Promise<Topic> {
    const newTopic = new Topic(2, 'New Topic', 1, args.sortOrder, false);
    dummyTemplateSteps.splice(
      args.sortOrder,
      0,
      new TemplateStep(newTopic, [])
    );

    return newTopic;
  }

  async getTemplateSteps(): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
  }

  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return [new TemplateCategory(1, 'Proposal Questionaries')];
  }
}
