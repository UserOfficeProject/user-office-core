import {
  EvaluatorOperator,
  FieldConfig,
  FieldDependency,
  ProposalTemplate,
  Questionary,
  QuestionRel,
  Question,
} from '../generated/sdk';
import { DataType } from '../generated/sdk';

export const create1Topic3FieldWithDependenciesQuestionary = (): Questionary => {
  return {
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
            question: {
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
            question: {
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
            question: {
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

export const create1TopicFieldlessTemplate = (): ProposalTemplate => {
  return {
    templateId: 1,
    name: 'test',
    callCount: 0,
    isArchived: false,
    proposalCount: 0,
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
}): QuestionRel => ({
  topicId: values.id || 1,
  sortOrder: values.sortOrder || Math.round(Math.random() * 100),
  question: values.question || {
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
