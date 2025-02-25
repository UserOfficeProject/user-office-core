import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../../models/ConditionEvaluator';
import {
  Answer,
  AnswerBasic,
  Questionary,
  QuestionaryStep,
} from '../../models/Questionary';
import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategoryId,
  TemplatesHasQuestions,
  Topic,
} from '../../models/Template';
import {
  BooleanConfig,
  EmbellishmentConfig,
  FieldConfigType,
  FileUploadConfig,
  SelectionFromOptionsConfig,
  TextInputConfig,
} from '../../resolvers/types/FieldConfig';
import { QuestionaryDataSource } from '../QuestionaryDataSource';
import { DeepPartial } from './ProposalDataSource';

export let dummyQuestionarySteps: QuestionaryStep[];
export let dummyQuestionary: Questionary;

export const dummyConfigFactory = (values?: any): typeof FieldConfigType => {
  return {
    required: true,
    small_label: 'small_label',
    tooltip: 'tooltip',
    ...values,
  };
};

const createDummyQuestionary = (values?: DeepPartial<Questionary>) => {
  return new Questionary(
    values?.questionaryId || 1,
    values?.templateId || 1,
    values?.creatorId || 1,
    new Date()
  );
};
export const dummyQuestionFactory = (
  values?: DeepPartial<Question> & Partial<Pick<Question, 'config'>>
): Question => {
  return new Question(
    values?.categoryId || TemplateCategoryId.PROPOSAL_QUESTIONARY,
    values?.id || 'random_field_name_' + Math.random(),
    values?.naturalKey || 'is_dangerous_goods',
    values?.dataType || DataType.TEXT_INPUT,
    values?.question || 'Some random question',
    values?.config || dummyConfigFactory()
  );
};

export const dummyQuestionTemplateRelationFactory = (
  values?: DeepPartial<QuestionTemplateRelation> &
    Partial<Pick<QuestionTemplateRelation, 'config' | 'dependencies'>> & {
      question: Partial<Pick<Question, 'config'>>;
    }
): QuestionTemplateRelation => {
  const relation = new QuestionTemplateRelation(
    dummyQuestionFactory(values?.question),
    values?.sortOrder || Math.round(Math.random() * 100),
    values?.topicId || Math.round(Math.random() * 10),
    values?.config || new BooleanConfig(),
    values?.dependencies as FieldDependency[],
    values?.dependenciesOperator as DependenciesLogicOperator
  );

  return relation;
};

export const dummyTemplateHasQuestionRelationFactory = (
  sortOrder: number,
  templateId: number
): TemplatesHasQuestions => {
  return new TemplatesHasQuestions(
    dummyQuestionFactory().id,
    templateId || Math.round(Math.random() * 100),
    Math.round(Math.random() * 10),
    sortOrder + 1,
    JSON.stringify(new BooleanConfig()),
    []
  );
};

const create1Topic3FieldWithDependenciesQuestionarySteps = () => {
  return [
    new QuestionaryStep(
      1,
      new Topic(1, 'General information', 1, 0, true),
      false,
      [
        new Answer(
          1,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'ttl_general',
              naturalKey: 'ttl_general',
              dataType: DataType.EMBELLISHMENT,
              config: createConfig<EmbellishmentConfig>(
                DataType.EMBELLISHMENT,
                {
                  plain: 'General information',
                  html: '<h1>General information</h1>',
                }
              ),
            }),
          }),
          null
        ),

        new Answer(
          2,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'has_links_with_industry',
              naturalKey: 'has_links_with_industry',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['yes', 'no'],
                  variant: 'radio',
                }
              ),
            }),
          }),
          'yes'
        ),

        new Answer(
          3,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'links_with_industry',
              naturalKey: 'links_with_industry',
              dataType: DataType.TEXT_INPUT,
              config: createConfig<TextInputConfig>(DataType.TEXT_INPUT, {
                placeholder: 'Please specify links with industry',
                multiline: true,
                required: true,
              }),
            }),
            dependencies: [
              new FieldDependency(
                'links_with_industry',
                'has_links_with_industry',
                'has_links_with_industry',
                new FieldCondition(EvaluatorOperator.eq, 'yes')
              ),
            ],
          }),
          'https://example.com'
        ),

        new Answer(
          4,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'multiple_choice',
              naturalKey: 'multiple_choice',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'dropdown',
                }
              ),
            }),
          }),
          ['A', 'B']
        ),

        new Answer(
          5,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'multiple_choice_depender',
              naturalKey: 'multiple_choice_depender',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'dropdown',
                }
              ),
            }),
            dependencies: [
              new FieldDependency(
                'multiple_choice_depender',
                'multiple_choice',
                'multiple_choice',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
            ],
          }),
          ['A', 'B']
        ),

        // OR questions
        new Answer(
          6,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'or_dependee_1',
              naturalKey: 'or_dependee_1',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'radio',
                }
              ),
            }),
          }),
          'A'
        ),

        new Answer(
          7,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'or_dependee_2',
              naturalKey: 'or_dependee_2',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'radio',
                }
              ),
            }),
            dependencies: [
              new FieldDependency(
                'multiple_choice_depender',
                'multiple_choice',
                'multiple_choice',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
            ],
          }),
          'B'
        ),

        new Answer(
          8,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'or_depender',
              naturalKey: 'or_depender',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'dropdown',
                }
              ),
            }),
            dependenciesOperator: DependenciesLogicOperator.OR,
            dependencies: [
              new FieldDependency(
                'or_depender',
                'or_dependee_1',
                'or_dependee_1',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
              new FieldDependency(
                'or_depender',
                'or_dependee_2',
                'or_dependee_2',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
            ],
          }),
          ['A', 'B']
        ),

        // AND questions
        new Answer(
          9,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'and_dependee_1',
              naturalKey: 'and_dependee_1',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'radio',
                }
              ),
            }),
          }),
          'A'
        ),

        new Answer(
          10,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'and_dependee_2',
              naturalKey: 'and_dependee_2',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'radio',
                }
              ),
            }),
          }),
          'B'
        ),

        new Answer(
          11,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              id: 'and_depender',
              naturalKey: 'and_depender',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: createConfig<SelectionFromOptionsConfig>(
                DataType.SELECTION_FROM_OPTIONS,
                {
                  options: ['A', 'B', 'C'],
                  variant: 'dropdown',
                }
              ),
            }),
            dependenciesOperator: DependenciesLogicOperator.AND,
            dependencies: [
              new FieldDependency(
                'and_depender',
                'and_dependee_1',
                'and_dependee_1',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
              new FieldDependency(
                'and_depender',
                'and_dependee_2',
                'and_dependee_2',
                new FieldCondition(EvaluatorOperator.eq, 'B')
              ),
            ],
          }),
          ['A', 'B']
        ),
      ]
    ),
  ];
};

export class QuestionaryDataSourceMock implements QuestionaryDataSource {
  constructor() {
    this.init();
  }

  public init() {
    dummyQuestionarySteps =
      create1Topic3FieldWithDependenciesQuestionarySteps();
    dummyQuestionary = createDummyQuestionary();
  }

  async deleteAnswers(questionary_id: number, question_id: string[]) {
    return;
  }
  async getAnswers(questionId: string): Promise<AnswerBasic[]> {
    return [];
  }

  async getTemplates(questionId: string): Promise<Template[]> {
    return [];
  }
  async getCount(templateId: number): Promise<number> {
    return 1;
  }

  async getIsCompleted(questionaryId: number): Promise<boolean> {
    return dummyQuestionarySteps.every((step) => step.isCompleted);
  }

  async clone(questionaryId: number): Promise<Questionary> {
    return createDummyQuestionary({ questionaryId: questionaryId + 1 });
  }

  async getAnswer(answer_id: number): Promise<AnswerBasic> {
    return new AnswerBasic(answer_id, 1, 'questionId', '', new Date());
  }

  async getBlankQuestionarySteps(
    _templateId: number
  ): Promise<QuestionaryStep[]> {
    return dummyQuestionarySteps;
  }

  async getBlankQuestionaryStepsByCallId(
    _templateId: number
  ): Promise<QuestionaryStep[]> {
    return dummyQuestionarySteps;
  }

  async delete(questionaryId: number): Promise<Questionary> {
    return createDummyQuestionary({ questionaryId });
  }

  async create(creator_id: number, template_id: number): Promise<Questionary> {
    return new Questionary(1, template_id, creator_id, new Date());
  }

  async updateAnswer(
    _proposalPk: number,
    questionId: string,
    answer: string
  ): Promise<AnswerBasic> {
    let updatedAnswer: Answer | undefined;
    let questionaryId = 1;

    dummyQuestionarySteps.forEach(
      (step) =>
        (updatedAnswer = step.fields.find((field) => {
          if (field.question.id === questionId) {
            questionaryId = step.questionaryId;
            field.value = answer;

            return true;
          }

          return false;
        }))
    );

    if (!updatedAnswer) {
      throw new Error('Question not found');
    }

    return new AnswerBasic(
      updatedAnswer.answerId,
      questionaryId,
      updatedAnswer.question.id,
      updatedAnswer.value,
      new Date()
    );
  }
  async insertFiles(
    _proposalPk: number,
    _questionId: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }

  async deleteFiles(
    _proposalPk: number,
    _questionId: string
  ): Promise<string[]> {
    return ['file_id_012345'];
  }

  async getQuestionary(questionary_id: number): Promise<Questionary | null> {
    return questionary_id === dummyQuestionary.questionaryId
      ? dummyQuestionary
      : null;
  }

  async getQuestionarySteps(
    _questionary_id: number
  ): Promise<QuestionaryStep[]> {
    return dummyQuestionarySteps;
  }

  async updateTopicCompleteness(
    questionary_id: number,
    topic_id: number,
    isComplete: boolean
  ): Promise<void> {
    if (dummyQuestionary.questionaryId === questionary_id) {
      dummyQuestionarySteps.find(
        (step) => step.topic.id === topic_id
      )!.isCompleted = isComplete;
    }
  }

  async copyAnswers(
    sourceQuestionaryId: number,
    targetQuestionaryId: number
  ): Promise<void> {
    return;
  }

  getProposalAttachments(proposalPk: number): Promise<Question[]> {
    const attachments = [
      dummyQuestionFactory({
        id: 'file_upload_id',
        naturalKey: 'file_upload_nk',
        dataType: DataType.FILE_UPLOAD,
        config: createConfig<FileUploadConfig>(DataType.FILE_UPLOAD, {
          omitFromPdf: false,
          file_type: ['pdf'],
          max_files: 1,
          pdf_page_limit: 0,
        }),
      }),
    ];

    return new Promise<Question[]>((resolve) => resolve(attachments));
  }
}
