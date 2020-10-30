/* eslint-disable @typescript-eslint/camelcase */
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import {
  Questionary,
  QuestionaryStep,
  Answer,
  AnswerBasic,
} from '../../models/Questionary';
import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  TemplateCategoryId,
  Topic,
  QuestionTemplateRelation,
} from '../../models/Template';
import {
  BooleanConfig,
  EmbellishmentConfig,
  FieldConfigType,
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
  values?: DeepPartial<Question>
): Question => {
  return new Question(
    values?.categoryId || TemplateCategoryId.PROPOSAL_QUESTIONARY,
    values?.proposalQuestionId || 'random_field_name_' + Math.random(),
    values?.naturalKey || 'is_dangerous',
    values?.dataType || DataType.TEXT_INPUT,
    values?.question || 'Some random question',
    (values?.config as any) || dummyConfigFactory()
  );
};

export const dummyQuestionTemplateRelationFactory = (
  values?: DeepPartial<QuestionTemplateRelation>
): QuestionTemplateRelation => {
  const relation = new QuestionTemplateRelation(
    dummyQuestionFactory(values?.question),
    values?.sortOrder || Math.round(Math.random() * 100),
    values?.topicId || Math.round(Math.random() * 10),
    (values?.config as any) || new BooleanConfig(),
    values?.dependency as any
  );

  return relation;
};

const create1Topic3FieldWithDependenciesQuestionarySteps = () => {
  return [
    new QuestionaryStep(
      new Topic(0, 'General information', 1, 0, true),
      false,
      [
        new Answer(
          1,
          dummyQuestionTemplateRelationFactory({
            question: dummyQuestionFactory({
              proposalQuestionId: 'ttl_general',
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
              proposalQuestionId: 'has_links_with_industry',
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
              proposalQuestionId: 'links_with_industry',
              naturalKey: 'links_with_industry',
              dataType: DataType.TEXT_INPUT,
              config: createConfig<TextInputConfig>(DataType.TEXT_INPUT, {
                placeholder: 'Please specify links with industry',
                multiline: true,
                required: true,
              }),
            }),
            dependency: new FieldDependency(
              'links_with_industry',
              'has_links_with_industry',
              'has_links_with_industry',
              new FieldCondition(EvaluatorOperator.eq, 'yes')
            ),
          }),
          'https://example.com'
        ),
      ]
    ),
  ];
};

export class QuestionaryDataSourceMock implements QuestionaryDataSource {
  async clone(questionaryId: number): Promise<Questionary> {
    return createDummyQuestionary({ questionaryId: questionaryId++ });
  }
  public init() {
    dummyQuestionarySteps = create1Topic3FieldWithDependenciesQuestionarySteps();
    dummyQuestionary = createDummyQuestionary();
  }

  async deleteAnswerQuestionaryRelations(
    answerId: number
  ): Promise<AnswerBasic> {
    const answers = dummyQuestionarySteps.reduce(
      (acc, val) => acc.concat(val.fields),
      new Array<Answer>()
    );
    const answer = answers.find(answer => answer.answerId === answerId)!;
    answer.value = '';

    return new AnswerBasic(answerId, 1, '', '', new Date());
  }
  async createAnswerQuestionaryRelations(
    answerId: number,
    questionaryIds: number[]
  ): Promise<AnswerBasic> {
    return new AnswerBasic(answerId, 1, '', '', new Date());
  }
  async getAnswer(answer_id: number): Promise<AnswerBasic> {
    return new AnswerBasic(answer_id, 1, 'questionId', '', new Date());
  }
  async getParentQuestionary(
    child_questionary_id: number
  ): Promise<Questionary | null> {
    return createDummyQuestionary();
  }

  async getBlankQuestionarySteps(
    template_id: number
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
    proposalId: number,
    questionId: string,
    answer: string
  ): Promise<string> {
    const updated = dummyQuestionarySteps.some(step =>
      step.fields.some(field => {
        if (field.question.proposalQuestionId === questionId) {
          field.value = answer;

          return true;
        }

        return false;
      })
    );
    if (!updated) {
      throw new Error('Question not found');
    }

    return questionId;
  }
  async insertFiles(
    proposalId: number,
    questionId: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }

  async deleteFiles(proposalId: number, questionId: string): Promise<string[]> {
    return ['file_id_012345'];
  }

  async getQuestionary(questionary_id: number): Promise<Questionary | null> {
    return questionary_id === dummyQuestionary.questionaryId
      ? dummyQuestionary
      : null;
  }

  async getQuestionarySteps(
    questionary_id: number
  ): Promise<QuestionaryStep[]> {
    return dummyQuestionarySteps;
  }

  async updateTopicCompleteness(
    questionary_id: number, // TODO name this questionary_id
    topic_id: number,
    isComplete: boolean
  ): Promise<void> {
    if (dummyQuestionary.questionaryId === questionary_id) {
      dummyQuestionarySteps.find(
        step => step.topic.id === topic_id
      )!.isCompleted = isComplete;
    }
  }
}
