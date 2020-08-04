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
import { EvaluatorOperator } from './ConditionEvaluator';

export class FieldDependency {
  constructor(
    public questionId: string,
    public dependencyId: string,
    public dependencyNaturalKey: string,
    public condition: FieldCondition
  ) {}
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
}

export class QuestionTemplateRelation {
  constructor(
    public question: Question,
    public topicId: number,
    public sortOrder: number,
    public config: typeof FieldConfigType,
    public dependency?: FieldDependency
  ) {}
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
}

export class AnswerBasic {
  constructor(
    public answerId: number,
    public questionaryId: number,
    public questionId: string,
    public answer: any,
    public createdAt: Date
  ) {}
}

export class QuestionaryStep {
  constructor(
    public topic: Topic,
    public isCompleted: boolean,
    public fields: Answer[]
  ) {}
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
const defaultConfigs = new Map<
  string,
  | BooleanConfig
  | DateConfig
  | EmbellishmentConfig
  | FileUploadConfig
  | SelectionFromOptionsConfig
  | TextInputConfig
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
  placeholder: '',
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
