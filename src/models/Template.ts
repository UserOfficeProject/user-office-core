import { Dependency } from '../datasources/postgres/records';
import { FieldConfigType } from '../resolvers/types/FieldConfig';
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from './ConditionEvaluator';

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
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SAMPLE_BASIS = 'SAMPLE_BASIS',
  PROPOSAL_BASIS = 'PROPOSAL_BASIS',
  INTERVAL = 'INTERVAL',
  NUMBER_INPUT = 'NUMBER_INPUT',
  SHIPMENT_BASIS = 'SHIPMENT_BASIS',
  RICH_TEXT_INPUT = 'RICH_TEXT_INPUT',
  VISIT_BASIS = 'VISIT_BASIS',
  GENERIC_TEMPLATE_BASIS = 'GENERIC_TEMPLATE_BASIS',
  PROPOSAL_ESI_BASIS = 'PROPOSAL_ESI_BASIS',
  SAMPLE_ESI_BASIS = 'SAMPLE_ESI_BASIS',
  FEEDBACK_BASIS = 'FEEDBACK_BASIS',
}

export class Topic {
  constructor(
    public id: number,
    public title: string,
    public templateId: number,
    public sortOrder: number,
    public isEnabled: boolean
  ) {}
}

export class Question {
  constructor(
    public categoryId: TemplateCategoryId,
    public id: string,
    public naturalKey: string,
    public dataType: DataType,
    public question: string,
    public config: typeof FieldConfigType
  ) {}
}

export class TemplatesHasQuestions {
  constructor(
    public questionId: string,
    public templateId: number,
    public topicId: number,
    public sortOrder: number,
    public config: string,
    public dependencies: Dependency[],
    public dependenciesOperator?: DependenciesLogicOperator
  ) {}
}

export class QuestionTemplateRelation {
  constructor(
    public question: Question,
    public topicId: number,
    public sortOrder: number,
    public config: typeof FieldConfigType,
    public dependencies: FieldDependency[],
    public dependenciesOperator?: DependenciesLogicOperator
  ) {}
}

export class TemplateGroup {
  constructor(
    public groupId: TemplateGroupId,
    public categoryId: TemplateCategoryId
  ) {}
}

export class TemplateStep {
  constructor(public topic: Topic, public fields: QuestionTemplateRelation[]) {}
}

export class TemplateCategory {
  constructor(public categoryId: TemplateCategoryId, public name: string) {}
}

export enum TemplateCategoryId {
  PROPOSAL_QUESTIONARY = 1,
  SAMPLE_DECLARATION = 2,
  SHIPMENT_DECLARATION = 3,
  VISIT_REGISTRATION = 4,
  GENERIC_TEMPLATE = 7,
  FEEDBACK = 8,
}

export enum TemplateGroupId {
  PROPOSAL = 'PROPOSAL',
  PROPOSAL_ESI = 'PROPOSAL_ESI',
  SAMPLE = 'SAMPLE',
  SAMPLE_ESI = 'SAMPLE_ESI',
  SHIPMENT = 'SHIPMENT',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  FEEDBACK = 'FEEDBACK',
}

export class FieldCondition {
  constructor(public condition: EvaluatorOperator, public params: any) {}
}

export class Template {
  constructor(
    public templateId: number,
    public groupId: TemplateGroupId,
    public name: string,
    public description: string,
    public isArchived: boolean
  ) {}
}

export enum ComparisonStatus {
  NEW = 'NEW',
  DIFFERENT = 'DIFFERENT',
  SAME = 'SAME',
}

export enum ConflictResolutionStrategy {
  USE_NEW = 'USE_NEW',
  USE_EXISTING = 'USE_EXISTING',
  UNRESOLVED = 'UNRESOLVED',
}

export class QuestionComparison {
  constructor(
    public existingQuestion: Question | null,
    public newQuestion: Question,
    public status: ComparisonStatus,
    public conflictResolutionStrategy: ConflictResolutionStrategy
  ) {}
}

export class TemplateValidationData {
  constructor(
    public isValid: boolean,
    public errors: string[],
    public questionComparisons: QuestionComparison[],
    public subTemplateValidationData: TemplateValidationData[]
  ) {}
}

export class TemplateValidation {
  constructor(
    public json: string,
    public version: string,
    public exportDate: Date,
    public validationData: TemplateValidationData
  ) {}
}

export class TemplateExportMetadata {
  constructor(public version: string, public exportDate: Date) {}
}

export class TemplateExportData {
  constructor(
    public template: Template,
    public templateSteps: TemplateStep[],
    public questions: Question[],
    public subTemplates: TemplateExportData[]
  ) {}
}

export class TemplateExport {
  constructor(
    public metadata: TemplateExportMetadata,
    public data: TemplateExportData
  ) {}
}
