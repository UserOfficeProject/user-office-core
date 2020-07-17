/* eslint-disable @typescript-eslint/camelcase */
import {
  BooleanConfig,
  DateConfig,
  EmbellishmentConfig,
  FieldConfigType,
  FileUploadConfig,
  SelectionFromOptionsConfig,
  TextInputConfig,
  SubtemplateConfig,
} from '../resolvers/types/FieldConfig';
import JSDict from '../utils/Dictionary';
import { EvaluatorOperator } from './ConditionEvaluator';

export class FieldDependency {
  constructor(
    public questionId: string,
    public dependencyId: string,
    public dependencyNaturalKey: string,
    public condition?: FieldCondition
  ) {}

  static fromObject(obj: any) {
    return new FieldDependency(
      obj.questionId,
      obj.dependencyId,
      obj.dependencyNaturalKey,
      typeof obj.condition == 'string'
        ? JSON.parse(obj.condition)
        : obj.condition
    );
  }
}

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT',
  SUBTEMPLATE = 'SUBTEMPLATE',
}

export class Topic {
  constructor(
    public id: number,
    public title: string,
    public sortOrder: number,
    public isEnabled: boolean
  ) {}

  public static fromObject(obj: any) {
    return new Topic(obj.id, obj.title, obj.sortOrder, obj.isEnabled);
  }
}

export class Question {
  constructor(
    public categoryId: TemplateCategoryId,
    public proposalQuestionId: string,
    public naturalKey: string,
    public dataType: DataType,
    public question: string,
    public config: typeof FieldConfigType
  ) {}

  static fromObject(obj: any) {
    return new Question(
      obj.category_id,
      obj.proposalQuestionId,
      obj.naturalKey,
      obj.dataType,
      obj.question,
      obj.config
    );
  }
}

export class QuestionTemplateRelation {
  constructor(
    public question: Question,
    public topicId: number,
    public sortOrder: number,
    public config: typeof FieldConfigType,
    public dependency?: FieldDependency
  ) {}

  public static fromObject(obj: any) {
    return new QuestionTemplateRelation(
      Question.fromObject(obj.question),
      obj.topicId,
      obj.sortOrder,
      obj.config,
      obj.dependency ? FieldDependency.fromObject(obj.dependency) : undefined
    );
  }
}
export class Answer extends QuestionTemplateRelation {
  constructor(
    public answerId: number,
    templateField: QuestionTemplateRelation,
    public value?: any
  ) {
    super(
      templateField.question,
      templateField.topicId,
      templateField.sortOrder,
      templateField.config,
      templateField.dependency
    );
  }
  static fromObject(obj: any) {
    const templateField = QuestionTemplateRelation.fromObject(obj);

    return new Answer(
      obj.answer_id,
      templateField,
      obj.value
        ? obj.value
        : templateField.question.dataType === DataType.BOOLEAN
        ? false
        : ''
    );
  }
}

export class QuestionaryStep {
  constructor(
    public topic: Topic,
    public isCompleted: boolean,
    public fields: Answer[]
  ) {}
  static fromObject(obj: any): QuestionaryStep | undefined {
    return new QuestionaryStep(
      Topic.fromObject(obj.topic),
      obj.isCompleted,
      obj.fields
        ? obj.fields.map((fieldObj: any) => Answer.fromObject(fieldObj))
        : []
    );
  }
}

export class Questionary {
  constructor(
    public questionaryId: number | undefined,
    public templateId: number,
    public creator_id: number,
    public created: Date
  ) {}
}

export class TemplateStep {
  constructor(public topic: Topic, public fields: QuestionTemplateRelation[]) {}

  public static fromObject(obj: any) {
    return new TemplateStep(
      Topic.fromObject(obj.topic),
      obj.fields.map((field: any) => QuestionTemplateRelation.fromObject(field))
    );
  }
}

export class Template {
  constructor(
    public templateId: number,
    public categoryId: number,
    public name: string,
    public description: string,
    public isArchived: boolean
  ) {}
}

export class TemplateCategory {
  constructor(public categoryId: TemplateCategoryId, public name: string) {}
}

export enum TemplateCategoryId {
  PROPOSAL_QUESTIONARY = 1,
  SAMPLE_DECLARATION,
}

export class FieldCondition {
  constructor(public condition: EvaluatorOperator, public params: any) {}

  static fromObject(obj: any) {
    const inpObj = typeof obj === 'string' ? JSON.parse(obj) : obj;

    return inpObj
      ? new FieldCondition(inpObj.condition, inpObj.params)
      : undefined;
  }
}

export enum ProposalStatus {
  BLANK = -1,
  DRAFT = 0,
  SUBMITTED = 1,
}

export enum ProposalEndStatus {
  UNSET = 0,
  ACCEPTED = 1,
  RESERVED = 2,
  REJECTED = 3,
}

export interface DataTypeSpec {
  readonly: boolean;
}

const baseDefaultConfig = { required: false, small_label: '', tooltip: '' };
const defaultConfigs = JSDict.Create<
  string,
  | BooleanConfig
  | DateConfig
  | EmbellishmentConfig
  | FileUploadConfig
  | SelectionFromOptionsConfig
  | TextInputConfig
  | SubtemplateConfig
>();
defaultConfigs.put('BooleanConfig', { ...baseDefaultConfig });
defaultConfigs.put('DateConfig', { ...baseDefaultConfig });

defaultConfigs.put('EmbellishmentConfig', {
  plain: '',
  html: '',
  omitFromPdf: false,
  ...baseDefaultConfig,
});
defaultConfigs.put('FileUploadConfig', {
  max_files: 1,
  file_type: [],
  ...baseDefaultConfig,
});
defaultConfigs.put('SelectionFromOptionsConfig', {
  options: [],
  variant: 'radio',
  ...baseDefaultConfig,
});
defaultConfigs.put('TextInputConfig', {
  multiline: false,
  isHtmlQuestion: false,
  placeholder: '',
  ...baseDefaultConfig,
});
defaultConfigs.put('SubtemplateConfig', {
  templateId: 0,
  templateCategory: TemplateCategoryId.SAMPLE_DECLARATION,
  ...baseDefaultConfig,
});

const f = JSDict.Create<string, () => typeof FieldConfigType>();
f.put(DataType.BOOLEAN, () => new BooleanConfig());
f.put(DataType.DATE, () => new DateConfig());
f.put(DataType.EMBELLISHMENT, () => new EmbellishmentConfig());
f.put(DataType.FILE_UPLOAD, () => new FileUploadConfig());
f.put(DataType.SELECTION_FROM_OPTIONS, () => new SelectionFromOptionsConfig());
f.put(DataType.TEXT_INPUT, () => new TextInputConfig());
f.put(DataType.SUBTEMPLATE, () => new SubtemplateConfig());

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
  const config = f.get(dataType)!;

  return createConfig(config(), init);
}
