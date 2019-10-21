import { User } from "./User";
import { Review } from "./Review";
import { EvaluatorOperator } from "./ConditionEvaluator";

export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposer: number,
    public status: ProposalStatus,
    public created: string,
    public updated: string
  ) {}
}

export class ProposalInformation {
  constructor(
    public id: number,
    public title?: string,
    public abstract?: string,
    public proposer?: number,
    public status?: ProposalStatus,
    public created?: string,
    public updated?: string,
    public users?: User[],
    public reviews?: Review[],
    public questionary?: Questionary
  ) {}
}

export class ProposalTemplate {
  constructor(public steps: TemplateStep[] = []) {}

  static fromObject(obj: any) {
    return new ProposalTemplate(
      obj.steps
        ? obj.steps.map((stepObj: any) => TemplateStep.fromObject(stepObj))
        : []
    );
  }
}

export class TemplateStep {
  constructor(public topic: Topic, public fields: ProposalTemplateField[]) {}

  public static fromObject(obj: any) {
    return new TemplateStep(
      Topic.fromObject(obj.topic),
      obj.fields.map((field: any) => ProposalTemplateField.fromObject(field))
    );
  }
}

export class ProposalTemplateField {
  constructor(
    public proposal_question_id: string,
    public data_type: DataType,
    public sort_order: number,
    public question: string,
    //public config: FieldConfig, // TODO strongly type this after making GraphQL accept union type configs
    public config: string,
    public topic_id: number,
    public dependencies: FieldDependency[] | null
  ) {}

  static fromObject(obj: any) {
    return new ProposalTemplateField(
      obj.proposal_question_id,
      obj.data_type,
      obj.sort_order,
      obj.question,
      obj.config,
      obj.topic_id,
      obj.dependencies
        ? obj.dependencies.map((dep: any) => FieldDependency.fromObject(dep))
        : null
    );
  }
}

export class Questionary {
  constructor(public steps: QuestionaryStep[]) {}

  static fromObject(obj: any): Questionary {
    return new Questionary(
      obj.steps
        ? obj.steps.map((stepObj: any) => QuestionaryStep.fromObject(stepObj))
        : []
    );
  }
}

export class QuestionaryStep {
  constructor(
    public topic: Topic,
    public isCompleted: boolean,
    public fields: QuestionaryField[]
  ) {}
  static fromObject(obj: any): QuestionaryStep | undefined {
    return new QuestionaryStep(
      Topic.fromObject(obj.topic),
      obj.isCompleted,
      obj.fields
        ? obj.fields.map((fieldObj: any) =>
            QuestionaryField.fromObject(fieldObj)
          )
        : []
    );
  }
}

export class QuestionaryField extends ProposalTemplateField {
  constructor(templateField: ProposalTemplateField, public value: any) {
    super(
      templateField.proposal_question_id,
      templateField.data_type,
      templateField.sort_order,
      templateField.question,
      templateField.config,
      templateField.topic_id,
      templateField.dependencies
    );
  }
  static fromObject(obj: any) {
    const templateField = ProposalTemplateField.fromObject(obj);
    return new QuestionaryField(
      templateField,
      obj.value ? JSON.parse(obj.value).value : undefined
    );
  }
}

export class Topic {
  constructor(
    public topic_id: number,
    public topic_title: string,
    public sort_order: number,
    public is_enabled: boolean
  ) {}

  public static fromObject(obj: any) {
    return new Topic(
      obj.topic_id,
      obj.topic_title,
      obj.sort_order,
      obj.is_enabled
    );
  }
}

export class FieldDependency {
  constructor(
    public proposal_question_id: string,
    public proposal_question_dependency: string,
    public condition: FieldCondition
  ) {}

  static fromObject(obj: any) {
    return new FieldDependency(
      obj.proposal_question_id,
      obj.proposal_question_dependency,
      typeof obj.condition == "string"
        ? JSON.parse(obj.condition)
        : obj.condition
    );
  }
}

export class FieldCondition {
  constructor(public condition: EvaluatorOperator, public params: any) {}

  static fromObject(obj: any) {
    return new FieldCondition(obj.condition, obj.params);
  }
}

export enum DataType {
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  EMBELLISHMENT = "EMBELLISHMENT",
  FILE_UPLOAD = "FILE_UPLOAD",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  TEXT_INPUT = "TEXT_INPUT"
}

export enum ProposalStatus {
  DRAFT = 0,
  SUBMITTED = 1
}

export interface ProposalAnswer {
  proposal_question_id: string;
  data_type: DataType;
  value: string;
}

export interface DataTypeSpec {
  readonly: boolean;
}

export interface FieldConfig {
  variant?: string;
  small_label?: string;
  required?: boolean;
  options?: string[];
  file_type?: string[];
  max_files?: number;
  multiline?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  html?: string;
  plain?: string;
}
