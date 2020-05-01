import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  ProposalTemplate,
  Question,
  QuestionRel,
  TemplateStep,
  Topic,
} from '../../models/ProposalModel';
import { getFieldById } from '../../models/ProposalModelFunctions';
import { CreateQuestionRelArgs } from '../../resolvers/mutations/CreateQuestionRelMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateProposalTemplateArgs } from '../../resolvers/mutations/UpdateProposalTemplateMutation';
import { UpdateQuestionRelArgs } from '../../resolvers/mutations/UpdateQuestionRelMutation';
import { ProposalTemplatesArgs } from '../../resolvers/queries/ProposalTemplatesQuery';
import { TemplateDataSource } from '../TemplateDataSource';
import {
  dummyQuestionFactory,
  dummyQuestionRelFactory,
} from './ProposalDataSource';

export let dummyProposalTemplate: ProposalTemplate;
export let dummyTemplateSteps: TemplateStep[];
export let dummyComplementarySteps: Question[];

const dummyProposalTemplateFactory = (values?: Partial<ProposalTemplate>) => {
  return new ProposalTemplate(
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
  async cloneTemplate(templateId: number): Promise<ProposalTemplate> {
    return dummyProposalTemplateFactory({ templateId: templateId + 1 });
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
    args: CreateQuestionRelArgs
  ): Promise<ProposalTemplate> {
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
    args: UpdateQuestionRelArgs
  ): Promise<ProposalTemplate> {
    const question = getFieldById(
      dummyTemplateSteps,
      args.questionId
    ) as QuestionRel;
    question.sortOrder = args.sortOrder || 0;
    question.topicId = args.topicId || 1;

    return dummyProposalTemplate;
  }
  async createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplate> {
    return dummyProposalTemplateFactory({ name, description });
  }
  async deleteTemplate(templateId: number): Promise<ProposalTemplate> {
    return dummyProposalTemplateFactory({ templateId });
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
