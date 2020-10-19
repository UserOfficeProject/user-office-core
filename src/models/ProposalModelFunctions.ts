/* eslint-disable @typescript-eslint/camelcase */
import {
  BooleanConfig,
  DateConfig,
  EmbellishmentConfig,
  FieldConfigType,
  FileUploadConfig,
  ProposalBasisConfig,
  SampleBasisConfig,
  SelectionFromOptionsConfig,
  SubtemplateConfig,
  TextInputConfig,
} from '../resolvers/types/FieldConfig';
import { logger } from '../utils/Logger';
import { ConditionEvaluator } from './ConditionEvaluator';
import { Answer, QuestionaryStep } from './Questionary';
import {
  DataType,
  DataTypeSpec,
  FieldDependency,
  QuestionTemplateRelation,
  TemplateCategoryId,
  TemplateStep,
} from './Template';
type AbstractField = QuestionTemplateRelation | Answer;
type AbstractCollection = TemplateStep[] | QuestionaryStep[];
export function getDataTypeSpec(type: DataType): DataTypeSpec {
  switch (type) {
    case DataType.EMBELLISHMENT:
      return { readonly: true };
    default:
      return { readonly: false };
  }
}
export function getTopicById(collection: AbstractCollection, topicId: number) {
  const step = collection.find(step => step.topic.id === topicId);

  return step ? step.topic : undefined;
}
export function getQuestionaryStepByTopicId(
  collection: AbstractCollection,
  topicId: number
) {
  return collection.find(step => step.topic.id === topicId);
}
export function getFieldById(
  collection: AbstractCollection,
  questionId: string
) {
  let needle: AbstractField | undefined;
  collection.every(step => {
    needle = step.fields.find(
      field => field.question.proposalQuestionId === questionId
    );

    return needle === undefined;
  });

  return needle;
}
export function getAllFields(collection: AbstractCollection) {
  let allFields = new Array<AbstractField>();
  collection.forEach(step => {
    allFields = allFields.concat(step.fields);
  });

  return allFields;
}
export function isDependencySatisfied(
  collection: QuestionaryStep[],
  dependency: FieldDependency | undefined
): boolean {
  if (!dependency?.condition) {
    return true;
  }
  const { condition, params } = dependency.condition;
  const field = getFieldById(collection, dependency.dependencyId) as
    | Answer
    | undefined;
  if (!field) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const isParentSatisfied = areDependenciesSatisfied(
    collection,
    dependency.dependencyId
  );

  return (
    isParentSatisfied &&
    new ConditionEvaluator()
      .getConditionEvaluator(condition)
      .isSatisfied(field, params)
  );
}
export function areDependenciesSatisfied(
  questionary: QuestionaryStep[],
  fieldId: string
) {
  const field = getFieldById(questionary, fieldId);
  if (!field) {
    return true;
  }

  return isDependencySatisfied(questionary, field.dependency);
}

class BaseValidator implements ConstraintValidator {
  constructor(private dataType?: DataType | undefined) {}

  validate(value: any, field: Answer) {
    if (this.dataType && field.question.dataType !== this.dataType) {
      throw new Error('Field validator ');
    }
    if (field.question.config.required && !value) {
      return false;
    }

    return true;
  }
}

class TextInputValidator extends BaseValidator {
  constructor() {
    super(DataType.TEXT_INPUT);
  }
  validate(value: any, field: Answer) {
    if (!super.validate(value, field)) {
      return false;
    }
    const config = field.question.config as TextInputConfig;
    if (config.min && value && value.length < config.min) {
      return false;
    }
    if (config.max && value && value.length > config.max) {
      return false;
    }

    return true;
  }
}

class SelectFromOptionsInputValidator extends BaseValidator {
  constructor() {
    super(DataType.SELECTION_FROM_OPTIONS);
  }
  validate(value: any, field: Answer) {
    const config = field.question.config as SelectionFromOptionsConfig;
    if (!super.validate(value, field)) {
      return false;
    }

    if (config.required && config.options!.indexOf(value) === -1) {
      return false;
    }

    return true;
  }
}

const validatorMap = new Map<DataType, ConstraintValidator>();
validatorMap.set(DataType.TEXT_INPUT, new TextInputValidator());
validatorMap.set(
  DataType.SELECTION_FROM_OPTIONS,
  new SelectFromOptionsInputValidator()
);

export function isMatchingConstraints(
  value: any,
  field: QuestionTemplateRelation
): boolean {
  const val = JSON.parse(value).value;
  const validator =
    validatorMap.get(field.question.dataType) || new BaseValidator();

  return validator.validate(val, field);
}

interface ConstraintValidator {
  validate(value: any, field: QuestionTemplateRelation): boolean;
}

const baseDefaultConfig = { required: false, small_label: '', tooltip: '' };
const defaultConfigs = new Map<
  string,
  | BooleanConfig
  | DateConfig
  | EmbellishmentConfig
  | FileUploadConfig
  | SelectionFromOptionsConfig
  | TextInputConfig
  | SampleBasisConfig
  | SubtemplateConfig
>();
defaultConfigs.set('BooleanConfig', { ...baseDefaultConfig });
defaultConfigs.set('DateConfig', { ...baseDefaultConfig });

defaultConfigs.set('EmbellishmentConfig', {
  plain: '',
  html: '',
  omitFromPdf: false,
  ...baseDefaultConfig,
});
defaultConfigs.set('FileUploadConfig', {
  max_files: 1,
  file_type: [],
  ...baseDefaultConfig,
});
defaultConfigs.set('SelectionFromOptionsConfig', {
  options: [],
  variant: 'radio',
  ...baseDefaultConfig,
});
defaultConfigs.set('TextInputConfig', {
  multiline: false,
  isHtmlQuestion: false,
  titlePlaceholder: '',
  ...baseDefaultConfig,
});

defaultConfigs.set('SampleBasisConfig', {
  titlePlaceholder: 'Title',
  ...baseDefaultConfig,
});

defaultConfigs.set('SubtemplateConfig', {
  templateId: 0,
  templateCategory: TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION],
  ...baseDefaultConfig,
});

const f = new Map<string, () => typeof FieldConfigType>();
f.set(DataType.BOOLEAN, () => new BooleanConfig());
f.set(DataType.DATE, () => new DateConfig());
f.set(DataType.EMBELLISHMENT, () => new EmbellishmentConfig());
f.set(DataType.FILE_UPLOAD, () => new FileUploadConfig());
f.set(DataType.SELECTION_FROM_OPTIONS, () => new SelectionFromOptionsConfig());
f.set(DataType.TEXT_INPUT, () => new TextInputConfig());
f.set(DataType.SUBTEMPLATE, () => new SubtemplateConfig());
f.set(DataType.SAMPLE_BASIS, () => new SampleBasisConfig());
f.set(DataType.PROPOSAL_BASIS, () => new ProposalBasisConfig());

export function createConfig<T extends typeof FieldConfigType>(
  config: T,
  init: Partial<T> | string = {}
): T {
  const defaults = defaultConfigs.get(config.constructor.name);
  const initValues = typeof init === 'string' ? JSON.parse(init) : init;
  Object.assign(config, { ...defaults, ...initValues });

  return config;
}

export function createConfigByType(dataType: DataType, init: object | string) {
  const configCreator = f.get(dataType)!;
  if (!configCreator) {
    logger.logError('ConfigCreator not implemented', { dataType });
    throw new Error('ConfigCreator not implemented');
  }

  return createConfig(configCreator(), init);
}

export function getDefaultAnswerValue(type: DataType): any {
  switch (type) {
    case DataType.BOOLEAN:
      return false;
    case DataType.FILE_UPLOAD:
    case DataType.SUBTEMPLATE:
      return [];
    default:
      return '';
  }
}
