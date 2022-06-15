import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  TemplateCategoryId,
  TemplateGroup,
  TemplateGroupId,
  TemplateValidation,
  TemplatesHasQuestions,
  TemplateStep,
  Topic,
} from '../../models/Template';
import { CreateTemplateArgs } from '../../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateQuestionTemplateRelationSettingsArgs } from '../../resolvers/mutations/UpdateQuestionTemplateRelationSettingsMutation';
import { UpdateTemplateArgs } from '../../resolvers/mutations/UpdateTemplateMutation';
import { QuestionsFilter } from '../../resolvers/queries/QuestionsQuery';
import { TemplatesArgs } from '../../resolvers/queries/TemplatesQuery';
import { SampleDeclarationConfig } from '../../resolvers/types/FieldConfig';
import { TemplateDataSource } from '../TemplateDataSource';
import {
  TemplateExport,
  TemplateValidationData,
} from './../../models/Template';
import {
  dummyQuestionFactory,
  dummyQuestionTemplateRelationFactory,
  dummyTemplateHasQuestionRelationFactory,
} from './QuestionaryDataSource';

export let dummyProposalTemplate: Template;
export let dummyTemplateSteps: TemplateStep[];
export let dummyComplementarySteps: Question[];

const dummyProposalTemplateFactory = (values?: Partial<Template>) => {
  return new Template(
    values?.templateId || 1,
    values?.groupId || TemplateGroupId.PROPOSAL,
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
      id: 'has_links_to_field',
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }),
  });
  const linksToField = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      id: 'links_to_field',
      dataType: DataType.TEXT_INPUT,
    }),
    dependencies: [
      new FieldDependency(
        'links_to_field',
        'has_links_to_field',
        'has_links_to_field',
        new FieldCondition(EvaluatorOperator.eq, 'yes')
      ),
    ],
  });

  const enableCrystallization = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      id: 'enable_crystallization',
      dataType: DataType.BOOLEAN,
      question: 'Is crystallization applicable',
      naturalKey: 'enable_crystallization',
    }),
  });

  const hasLinksWithIndustry = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      id: 'has_links_with_industry',
      dataType: DataType.BOOLEAN,
      question: 'Has links with industry',
      naturalKey: 'has_links_with_industry',
    }),
  });

  const proposalBasis = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      id: 'proposal_basis',
      naturalKey: 'proposal_basis',
      dataType: DataType.PROPOSAL_BASIS,
    }),
  });

  const samplesField = dummyQuestionTemplateRelationFactory({
    question: dummyQuestionFactory({
      id: 'experiment_samples',
      naturalKey: 'experiment_samples',
      dataType: DataType.SAMPLE_DECLARATION,
      config: { esiTemplateId: 1 } as SampleDeclarationConfig,
    }),
  });

  return [
    new TemplateStep(new Topic(1, 'General information', 1, 1, true), [
      hasLinksToField,
      linksToField,
      hasLinksWithIndustry,
      enableCrystallization,
      proposalBasis,
      samplesField,
    ]),
  ];
};

export class TemplateDataSourceMock implements TemplateDataSource {
  constructor() {
    this.init();
  }
  importTemplate(templateExport: TemplateExport): Promise<Template> {
    throw new Error('Method not implemented.');
  }

  async getTemplateExport(templateId: number): Promise<TemplateExport> {
    return {
      metadata: {
        version: '1.0.0',
        exportDate: new Date(),
      },
      data: {
        template: dummyProposalTemplate,
        templateSteps: [],
        questions: [],
        subTemplates: [],
      },
    };
  }

  async getGroup(groupId: TemplateGroupId): Promise<TemplateGroup> {
    return new TemplateGroup(groupId, TemplateCategoryId.PROPOSAL_QUESTIONARY);
  }
  public init() {
    dummyProposalTemplate = dummyProposalTemplateFactory();
    dummyTemplateSteps = dummyTemplateStepsFactory();
    dummyComplementarySteps = [
      dummyQuestionFactory({
        id: 'not_in_template',
        naturalKey: 'not_in_template',
      }),
    ];
  }

  async getComplementaryQuestions(
    _templateId: number
  ): Promise<Question[] | null> {
    return [dummyQuestionFactory()];
  }

  async cloneTemplate(templateId: number): Promise<Template> {
    return dummyProposalTemplateFactory({ templateId: templateId + 1 });
  }

  async getTemplate(_templateId: number): Promise<Template | null> {
    return dummyProposalTemplate;
  }

  async updateTemplate(values: UpdateTemplateArgs): Promise<Template | null> {
    dummyProposalTemplate = { ...dummyProposalTemplate, ...values };

    return dummyProposalTemplate;
  }

  async getQuestionTemplateRelation(
    questionId: string,
    _templateId: number
  ): Promise<QuestionTemplateRelation | null> {
    return dummyQuestionTemplateRelationFactory({
      question: { id: questionId },
    });
  }

  async getQuestionTemplateRelations(
    sortOrder: number,
    templateId: number,
    _questionToExcludeId?: string
  ): Promise<TemplatesHasQuestions[] | null> {
    return [dummyTemplateHasQuestionRelationFactory(sortOrder, templateId)];
  }

  async deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template> {
    dummyTemplateSteps.forEach(function (step) {
      step.fields = step.fields.filter((field) => {
        return field.question.id !== args.questionId;
      });
    });

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
        TemplateGroupId.PROPOSAL,
        'Industrial',
        'Industrial proposal template',
        args?.filter?.isArchived || false
      ),
    ];
  }
  async isNaturalKeyPresent(_naturalKey: string): Promise<boolean> {
    return true;
  }

  async deleteTopic(id: number): Promise<Topic> {
    return dummyTopicFactory({ id });
  }
  async createQuestion(
    _categoryId: TemplateCategoryId,
    questionId: string,
    naturalKey: string,
    dataType: DataType,
    question: string
  ): Promise<Question> {
    return dummyQuestionFactory({
      naturalKey: naturalKey,
      dataType: dataType,
      id: questionId,
      question,
    });
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    const steps = await this.getTemplateSteps();
    const allQuestions = steps.map((step) => step.fields).flat();
    const templateHasQuestion = allQuestions.find(
      (templateHasQuestion) => templateHasQuestion.question.id === questionId
    );

    return templateHasQuestion?.question ?? null;
  }

  async getQuestionByNaturalKey(naturalKey: string): Promise<Question | null> {
    const steps = await this.getTemplateSteps();
    const allQuestions = steps.map((step) => step.fields).flat();
    const templateHasQuestion = allQuestions.find(
      (templateHasQuestion) =>
        templateHasQuestion.question.naturalKey === naturalKey
    );

    return templateHasQuestion?.question ?? null;
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} does not exist`);
    }
    const copy = dummyQuestionFactory(question);
    question.id = 'deleted_question'; //works for mocking purposes

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
      (curQuestion) => curQuestion.question.id === questionId
    );

    if (questionTemplateRelation) {
      const { question } = questionTemplateRelation;
      Object.assign(question, values);

      return question;
    } else {
      throw new Error('Not found');
    }
  }

  async updateTopicTitle(topicId: number, title: string): Promise<Topic> {
    const steps = await this.getTemplateSteps();
    const allTopics = steps.reduce((accumulated, current) => {
      return accumulated.concat(current.topic);
    }, new Array<Topic>());

    const topic = allTopics.find((topic) => topic.id === topicId);

    if (!topic) {
      throw new Error('Topic not found');
    }
    Object.assign(topic, { title });

    return topic;
  }

  async updateQuestionTemplateRelationSettings(
    _args: UpdateQuestionTemplateRelationSettingsArgs
  ): Promise<Template> {
    return dummyProposalTemplate;
  }

  async upsertQuestionTemplateRelations(
    _collection: TemplatesHasQuestions[]
  ): Promise<Template> {
    return dummyProposalTemplate;
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

  async upsertTopics(_data: Topic[]): Promise<Template> {
    return dummyProposalTemplate;
  }

  async getTopics(
    _templateId: number,
    _topicToExcludeId?: number
  ): Promise<Topic[]> {
    return [dummyTopicFactory()];
  }

  async getTemplateSteps(): Promise<TemplateStep[]> {
    return dummyTemplateSteps;
  }

  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return [new TemplateCategory(1, 'Proposal Questionaries')];
  }

  async setActiveTemplate(_args: any): Promise<boolean> {
    return true;
  }

  async getActiveTemplateId(_groupId: TemplateGroupId): Promise<number | null> {
    return 1;
  }

  async getQuestions(filter?: QuestionsFilter): Promise<Question[]> {
    return [dummyQuestionFactory()];
  }

  async getQuestionsInTemplate(templateId: number): Promise<Question[]> {
    return dummyTemplateSteps.flatMap((step) =>
      step.fields.map((field) => field.question)
    );
  }

  async validateTemplateExport(
    templateExport: TemplateExport
  ): Promise<TemplateValidation> {
    return new TemplateValidation(
      '{}',
      '1.0.0',
      new Date(),
      new TemplateValidationData(true, [], [], [])
    );
  }
}
