import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Template,
  Question,
  QuestionRel,
  TemplateStep,
  Topic,
  TemplateCategory,
} from '../../models/ProposalModel';
import { getFieldById } from '../../models/ProposalModelFunctions';
import { CreateQuestionRelArgs } from '../../resolvers/mutations/CreateQuestionRelMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateQuestionRelArgs } from '../../resolvers/mutations/UpdateQuestionRelMutation';
import { UpdateTemplateArgs } from '../../resolvers/mutations/UpdateTemplateMutation';
import { TemplatesArgs } from '../../resolvers/queries/TemplatesQuery';
import { TemplateDataSource } from '../TemplateDataSource';
import {
  dummyQuestionRelFactory,
  dummyQuestionFactory,
} from './QuestionaryDataSource';

export let dummyProposalTemplate: Template;
export let dummyTemplateSteps: TemplateStep[];
export let dummyComplementarySteps: Question[];

const dummyProposalTemplateFactory = (values?: Partial<Template>) => {
  return new Template(
    values?.templateId || 1,
    values?.name || 'Industrial template',
    values?.description || 'Industrial template description',
    values?.isArchived || false
  );
};

const dummyTopicFactory = (values?: Partial<Topic>) => {
  return new Topic(
    values?.id || 1,
    values?.title || 'General information',
    values?.sortOrder || 0,
    values?.isEnabled || true
  );
};

const dummyTemplateStepsFactory = () => {
  const hasLinksToField = dummyQuestionRelFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'has_links_to_field',
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }),
  });
  const linksToField = dummyQuestionRelFactory({
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

  const enableCrystallization = dummyQuestionRelFactory({
    question: dummyQuestionFactory({
      proposalQuestionId: 'enable_crystallization',
      dataType: DataType.BOOLEAN,
      question: 'Is crystallization aplicable',
      naturalKey: 'enable_crystallization',
    }),
  });

  const hasLinksWithIndustry = dummyQuestionRelFactory({
    question: dummyQuestionFactory({
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
  async createQuestionRel(args: CreateQuestionRelArgs): Promise<Template> {
    return dummyProposalTemplate;
  }
  async getQuestionRel(
    questionId: string,
    templateId: number
  ): Promise<QuestionRel | null> {
    return dummyQuestionRelFactory({
      question: { proposalQuestionId: questionId },
    });
  }
  async deleteQuestionRel(args: DeleteQuestionRelArgs): Promise<Template> {
    dummyTemplateSteps.forEach(function(step) {
      step.fields = step.fields.filter(field => {
        return field.question.proposalQuestionId !== args.questionId;
      });
    });

    return dummyProposalTemplate;
  }
  async updateQuestionRel(args: UpdateQuestionRelArgs): Promise<Template> {
    const question = getFieldById(
      dummyTemplateSteps,
      args.questionId
    ) as QuestionRel;
    question.sortOrder = args.sortOrder || 0;
    question.topicId = args.topicId || 1;

    return dummyProposalTemplate;
  }
  async createTemplate(name: string, description?: string): Promise<Template> {
    return dummyProposalTemplateFactory({ name, description });
  }
  async deleteTemplate(templateId: number): Promise<Template> {
    return dummyProposalTemplateFactory({ templateId });
  }
  async getTemplates(args?: TemplatesArgs): Promise<Template[]> {
    return [
      new Template(
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
    return dummyQuestionFactory({ proposalQuestionId: questionId });
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    return dummyQuestionFactory({ proposalQuestionId: questionId });
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

  async createTopic(args: CreateTopicArgs): Promise<Template> {
    dummyTemplateSteps.splice(
      args.sortOrder,
      0,
      new TemplateStep(new Topic(2, 'New Topic', args.sortOrder, false), [])
    );

    return dummyProposalTemplate;
  }

  async getTemplateSteps(): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
  }

  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return [new TemplateCategory(1, 'Proposal Questionaries')];
  }
}
