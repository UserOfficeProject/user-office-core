import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { Knex } from 'knex';

import { QuestionFilterInput } from '../../resolvers/queries/ProposalsQuery';
import { DynamicMultipleChoiceConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { booleanDefinition } from './Boolean';
import { dateDefinition } from './Date';
import { dynamicMultipleChoiceDefinition } from './DynamicMultipleChoice';
import { embellishmentDefinition } from './Embellishment';
import { feedbackBasisDefinition } from './FeedbackBasis';
import { fileUploadDefinition } from './FileUpload';
import { genericTemplateDefinition } from './GenericTemplate';
import { genericTemplateBasisDefinition } from './GenericTemplateBasis';
import { instrumentPickerDefinition } from './InstrumentPicker';
import { intervalDefinition } from './Interval';
import { numberInputDefinition } from './NumberInput';
import { proposalBasisDefinition } from './ProposalBasis';
import { proposalEsiBasisDefinition } from './ProposalEsiBasis';
import { richTextInputDefinition } from './RichTextInput';
import { sampleBasisDefinition } from './SampleBasis';
import { sampleDeclarationDefinition } from './SampleDeclaration';
import { sampleEsiBasisDefinition } from './SampleEsiBasis';
import { selectionFromOptionsDefinition } from './SelectionFromOptions';
import { shipmentBasis } from './ShipmentBasis';
import { textInputDefinition } from './TextInput';
import { visitBasisDefinition } from './VisitBasis';

export interface Question {
  /**
   * The enum value from DataType
   */
  readonly dataType: DataType;

  /**
   * Perform validation rules before persisting data into the database
   */
  readonly validate?: (
    field: QuestionTemplateRelation,
    value: any
  ) => Promise<boolean>;

  /**
   * Question can contain configuration, e.g. isRequired, maxValue, etc,
   * This function returns configuration for newly created questions
   */
  readonly createBlankConfig: () => any;

  /**
   * Returns the answer value for the question that is not answered yet
   */
  readonly getDefaultAnswer: (field: QuestionTemplateRelation) => any;

  /**
   * Function to transform the value before storing in the database.
   * Good for sanitizing, or adjusting the format of the answer
   */
  readonly transform?: (field: QuestionTemplateRelation, value: any) => any;

  /**
   * Function that is used when searching answers.
   * @param query Knex query builder, on which Knex methods can be invoked to adjust
   * search query. e.g. `query.andWhere(....)`
   * @param filter search criteria provided by the user
   */
  readonly filterQuery?: (
    query: Knex.QueryBuilder<any, any>,
    filter: QuestionFilterInput
  ) => any;

  readonly externalApiCall?: (
    config: DynamicMultipleChoiceConfig
  ) => Promise<DynamicMultipleChoiceConfig>;
}

// Add new component definitions here
const registry = [
  booleanDefinition,
  dateDefinition,
  embellishmentDefinition,
  feedbackBasisDefinition,
  fileUploadDefinition,
  genericTemplateBasisDefinition,
  genericTemplateDefinition,
  intervalDefinition,
  numberInputDefinition,
  proposalBasisDefinition,
  proposalEsiBasisDefinition,
  richTextInputDefinition,
  sampleBasisDefinition,
  sampleDeclarationDefinition,
  sampleEsiBasisDefinition,
  selectionFromOptionsDefinition,
  shipmentBasis,
  textInputDefinition,
  dynamicMultipleChoiceDefinition,
  visitBasisDefinition,
  instrumentPickerDefinition,
];

Object.freeze(registry);

const componentMap = new Map<DataType, Question>();
registry.forEach((definition) =>
  componentMap.set(definition.dataType, definition)
);

export const getQuestionDefinition = (dataType: DataType) => {
  const definition = componentMap.get(dataType);
  if (!definition) {
    logger.logError('Tried to obtain non-existing definition', { dataType });
    throw new GraphQLError('Tried to obtain non-existing definition');
  }

  return definition;
};

/**
 * Convenience function to create config for datatype with initial data
 */
export function createConfig<T extends object>(
  dataType: DataType,
  init: Partial<T> | string = {}
): T {
  const definition = getQuestionDefinition(dataType);
  const config: T = definition.createBlankConfig();
  const initValues: Partial<T> =
    typeof init === 'string' ? JSON.parse(init) : init;

  Object.assign(config, { ...initValues });

  return config;
}

/**
 * Convenience function to get default value for datatype
 */
export function getDefaultAnswerValue(
  questionTemplateRelation: QuestionTemplateRelation
): any {
  const definition = getQuestionDefinition(
    questionTemplateRelation.question.dataType
  );

  return definition.getDefaultAnswer(questionTemplateRelation);
}

export async function getExternalApiCallData(
  dataType: DataType,
  config: DynamicMultipleChoiceConfig
) {
  const definition = getQuestionDefinition(dataType);

  if (!definition.externalApiCall) {
    logger.logError('Tried to make non-existing definition callback', {
      dataType: dataType,
    });
    throw new GraphQLError('Tried to execute non-existing definition callback');
  }

  return await definition.externalApiCall(config);
}
