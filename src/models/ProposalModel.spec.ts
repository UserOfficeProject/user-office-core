import {
  Template,
  Questionary,
  DataType,
  EvaluatorOperator,
  Question,
  FieldConfig,
  FieldDependency,
  QuestionTemplateRelation,
  TemplateCategoryId,
} from 'generated/sdk';
import {
  getAllFields,
  getFieldById,
  getTopicById,
  getQuestionaryStepByTopicId,
} from 'models/ProposalModelFunctions';

export const create1TopicFieldlessTemplate = (): Template => {
  return {
    templateId: 1,
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    name: 'test',
    isArchived: false,
    description: 'desription',
    steps: [
      {
        topic: {
          id: 0,
          title: 'General information',
          sortOrder: 0,
          isEnabled: true,
        },
        fields: [],
      },
    ],
    complementaryQuestions: [],
  };
};

export const create1Topic3FieldWithDependenciesQuestionary = (): Questionary => {
  return {
    questionaryId: 1,
    templateId: 1,
    created: new Date(),
    steps: [
      {
        topic: {
          title: 'General information',
          id: 0,
          sortOrder: 1,
          isEnabled: true,
        },
        isCompleted: false,
        fields: [
          {
            topicId: 0,
            config: {
              html: 'General information',
              plain: 'General information',
              small_label: '',
              required: false,
              tooltip: '',
            },
            question: {
              categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
              question: '',
              proposalQuestionId: 'ttl_general',
              naturalKey: 'ttl_general',
              dataType: DataType.EMBELLISHMENT,
              config: {
                html: 'General information',
                plain: 'General information',
                small_label: '',
                required: false,
                tooltip: '',
              },
            },

            value: '',
            sortOrder: 1,
          },
          {
            topicId: 0,
            config: {
              variant: 'radio',
              options: ['yes', 'no'],
              small_label: '',
              required: false,
              tooltip: '',
            },
            question: {
              categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
              question: 'Has links with industry',
              proposalQuestionId: 'has_links_with_industry',
              naturalKey: 'has_links_with_industry',
              dataType: DataType.SELECTION_FROM_OPTIONS,
              config: {
                variant: 'radio',
                options: ['yes', 'no'],
                small_label: '',
                required: false,
                tooltip: '',
              },
            },

            value: '',
            sortOrder: 2,
          },
          {
            topicId: 0,
            config: {
              min: 0,
              max: 1000000,
              multiline: false,
              placeholder: 'Please specify links with industry',
              small_label: '',
              required: false,
              tooltip: '',
            },
            question: {
              categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
              question: 'If yes, please describe:',
              proposalQuestionId: 'links_with_industry',
              naturalKey: 'links_with_industry',
              dataType: DataType.TEXT_INPUT,
              config: {
                min: 0,
                max: 1000000,
                multiline: false,
                placeholder: 'Please specify links with industry',
                small_label: '',
                required: false,
                tooltip: '',
              },
            },

            value: '',
            sortOrder: 2,
            dependency: {
              dependencyId: 'has_links_with_industry',
              condition: {
                condition: EvaluatorOperator.EQ,
                params: 'yes',
              },
              questionId: 'links_with_industry',
              dependencyNaturalKey: 'has_links_with_industry',
            },
          },
        ],
      },
    ],
  };
};

export const createDummyField = (values: {
  dataType?: DataType;
  proposalQuestionId?: string;
  naturalKey?: string;
  sortOrder?: number;
  id?: number;
  question?: Question;
  config?: FieldConfig;
  dependency?: FieldDependency;
}): QuestionTemplateRelation => ({
  topicId: values.id || 1,
  config: values.config || {
    required: false,
    small_label: '',
    tooltip: '',
    min: 0,
    max: 0,
  },
  sortOrder: values.sortOrder || Math.round(Math.random() * 100),
  question: values.question || {
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    question: 'Some random question',
    proposalQuestionId:
      values.proposalQuestionId || 'random_field_name_' + Math.random(),
    naturalKey: values.naturalKey || 'is_dangerous',
    dataType: values.dataType || DataType.TEXT_INPUT,
    config: values.config || {
      required: false,
      small_label: '',
      tooltip: '',
      min: 0,
      max: 0,
    },
  },
  dependency: values.dependency,
});

test('Can parse object', () => {
  const template = create1Topic3FieldWithDependenciesQuestionary();
  expect(getAllFields(template.steps).length).toBe(3);
  expect(
    getFieldById(template.steps, 'links_with_industry')!.dependency
  ).not.toBe(null);
  expect(
    getFieldById(template.steps, 'links_with_industry')!.dependency
      ?.dependencyId
  ).toBe('has_links_with_industry');

  const fieldlessTemplate = create1TopicFieldlessTemplate();
  expect(
    getQuestionaryStepByTopicId(fieldlessTemplate.steps, 0)!.fields.length
  ).toBe(0);
  expect(getTopicById(fieldlessTemplate.steps, 1)).toBe(undefined);
});
