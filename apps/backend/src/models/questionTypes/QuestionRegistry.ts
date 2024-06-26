import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { Knex } from 'knex';

import { AnswerInput } from '../../resolvers/mutations/AnswerTopicMutation';
import { QuestionFilterInput } from '../../resolvers/queries/ProposalsQuery';
import {
  BooleanConfig,
  DateConfig,
  DynamicMultipleChoiceConfig,
  EmbellishmentConfig,
  FeedbackBasisConfig,
  FileUploadConfig,
  GenericTemplateBasisConfig,
  InstrumentPickerConfig,
  IntervalConfig,
  NumberInputConfig,
  ProposalBasisConfig,
  ProposalEsiBasisConfig,
  RichTextInputConfig,
  SampleBasisConfig,
  SampleDeclarationConfig,
  SampleEsiBasisConfig,
  SelectionFromOptionsConfig,
  ShipmentBasisConfig,
  TechniquePickerConfig,
  TextInputConfig,
  VisitBasisConfig,
} from '../../resolvers/types/FieldConfig';
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
import { techniquePickerDefinition } from './TechniquePicker';
import { textInputDefinition } from './TextInput';
import { visitBasisDefinition } from './VisitBasis';

export type QuestionDataTypeConfigMapping<T> = T extends DataType.BOOLEAN
  ? BooleanConfig
  : T extends DataType.DATE
    ? DateConfig
    : T extends DataType.EMBELLISHMENT
      ? EmbellishmentConfig
      : T extends DataType.FILE_UPLOAD
        ? FileUploadConfig
        : T extends DataType.GENERIC_TEMPLATE
          ? GenericTemplateBasisConfig
          : T extends DataType.SELECTION_FROM_OPTIONS
            ? SelectionFromOptionsConfig
            : T extends DataType.TEXT_INPUT
              ? TextInputConfig
              : T extends DataType.SAMPLE_DECLARATION
                ? SampleDeclarationConfig
                : T extends DataType.SAMPLE_BASIS
                  ? SampleBasisConfig
                  : T extends DataType.PROPOSAL_BASIS
                    ? ProposalBasisConfig
                    : T extends DataType.INTERVAL
                      ? IntervalConfig
                      : T extends DataType.NUMBER_INPUT
                        ? NumberInputConfig
                        : T extends DataType.SHIPMENT_BASIS
                          ? ShipmentBasisConfig
                          : T extends DataType.RICH_TEXT_INPUT
                            ? RichTextInputConfig
                            : T extends DataType.VISIT_BASIS
                              ? VisitBasisConfig
                              : T extends DataType.GENERIC_TEMPLATE_BASIS
                                ? GenericTemplateBasisConfig
                                : T extends DataType.PROPOSAL_ESI_BASIS
                                  ? ProposalEsiBasisConfig
                                  : T extends DataType.SAMPLE_ESI_BASIS
                                    ? SampleEsiBasisConfig
                                    : T extends DataType.FEEDBACK_BASIS
                                      ? FeedbackBasisConfig
                                      : T extends DataType.DYNAMIC_MULTIPLE_CHOICE
                                        ? DynamicMultipleChoiceConfig
                                        : T extends DataType.INSTRUMENT_PICKER
                                          ? InstrumentPickerConfig
                                          : T extends DataType.TECHNIQUE_PICKER
                                            ? TechniquePickerConfig
                                            : never;

export interface Question<T extends DataType> {
  /**
   * The enum value from DataType
   */
  readonly dataType: T;

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

  /**
   * Function to transform the config value before sending back to the front end.
   * Ideal for changes in config at run time.
   */
  readonly transformConfig?: (
    config: QuestionDataTypeConfigMapping<T>,
    callId?: number
  ) => Promise<QuestionDataTypeConfigMapping<T>>;

  onBeforeSave?: (
    questionaryId: number,
    questionTemplateRelation: QuestionTemplateRelation,
    answer: AnswerInput
  ) => Promise<void>;
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
  techniquePickerDefinition,
];

Object.freeze(registry);

const componentMap = new Map<DataType, Question<DataType>>();
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

export async function getTransformedConfigData<T extends DataType>(
  dataType: T,
  config: QuestionDataTypeConfigMapping<T>,
  callId?: number
) {
  const definition = getQuestionDefinition(dataType);

  if (!definition.transformConfig) {
    return config;
  }

  return await definition.transformConfig(config, callId);
}
