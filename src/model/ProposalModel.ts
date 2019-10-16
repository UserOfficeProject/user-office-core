import { ConditionEvaluator } from "./ConditionEvaluator";
import { object } from "prop-types";

export class ProposalData {
  constructor(
    public id: number,
    public title?: string,
    public abstract?: string,
    public proposer?: number,
    public status?: ProposalStatus,
    public questionary?: ProposalTemplate,
    public created?: string,
    public updated?: string
  ) {}
}

export class ProposalTemplate {
  private conditionEvalator = new ConditionEvaluator();

  constructor(public topics: Topic[] = []) {}

  static fromObject(obj: any) {
    return new ProposalTemplate(
      obj.topics
        ? obj.topics.forEach((topicObj: any) => Topic.fromObject(topicObj))
        : []
    );
  }

  public static getTopicById(
    template: ProposalTemplate,
    topicId: number
  ): Topic | undefined {
    return template.topics.find(topic => topic.topic_id === topicId);
  }

  public static getFieldById = (
    template: ProposalTemplate,
    questionId: string
  ) => {
    let needle: ProposalTemplateField | undefined;
    template.topics.some(topic => {
      needle = topic.fields.find(
        field => field.proposal_question_id === questionId
      );
      return needle;
    });
    return needle;
  };
  public static areDependenciesSatisfied(
    template: ProposalTemplate,
    fieldId: string
  ) {
    const field = ProposalTemplate.getFieldById(template, fieldId);
    if (!field) {
      return true;
    }
    const isAtLeastOneDissasisfied = field.dependencies!.some(dep =>
      ProposalTemplate.isDependencySatisfied(dep)
    );
    return isAtLeastOneDissasisfied === false;
  }

  public static isDependencySatisfied(dependency: FieldDependency): boolean {
    const { condition, params } = dependency.condition;
    const field = this.getFieldById(dependency.proposal_question_dependency);
    const isParentSattisfied = this.areDependenciesSatisfied(
      dependency.proposal_question_dependency
    );
    return (
      isParentSattisfied &&
      this.conditionEvalator
        .getConfitionEvaluator(condition)
        .isSattisfied(field, params)
    );
  }
}

export class Topic {
  constructor(
    public topic_id: number,
    public topic_title: string,
    public fields: ProposalTemplateField[]
  ) {}

  public static getFieldById = (topic: Topic, questionId: string) =>
    topic.fields &&
    topic.fields.find(field => field.proposal_question_id === questionId)!;

  public static addField(topic: Topic, tempfield: ProposalTemplateField): void {
    topic.fields.unshift(tempfield);
  }

  public static fromObject(obj: any) {
    return new Topic(
      obj.topic_id,
      obj.topic_title,
      obj.fields
        ? obj.fields.map((field: any) =>
            ProposalTemplateField.formObject(field)
          )
        : []
    );
  }
}

export class ProposalTemplateField {
  constructor(
    public proposal_question_id: string,
    public data_type: DataType,
    public question: string,
    public config: FieldConfig,
    public topic_id: number,
    public value: any = "",
    public dependencies: FieldDependency[] | null
  ) {}

  static formObject(obj: any) {
    return new ProposalTemplateField(
      obj.proposal_question_id,
      obj.data_type,
      obj.question,
      typeof obj.config == "string" ? JSON.parse(obj.config) : obj.config,
      obj.topic_id,
      obj.value,
      obj.dependencies
        ? obj.dependencies.map((dep: any) => FieldDependency.fromObject(dep))
        : null
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
  constructor(public condition: string, public params: any) {}

  static fromObject(obj: any) {
    return new FieldCondition(obj.condition, obj.params);
  }
}

export interface ProposalAnswer {
  proposal_question_id: string;
  value: boolean | number | string;
  data_type: DataType;
}

export enum DataType {
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  EMBELLISHMENT = "EMBELLISHMENT",
  FILE_UPLOAD = "FILE_UPLOAD",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  TEXT_INPUT = "TEXT_INPUT"
}

export interface DataTypeSpec {
  readonly: boolean;
}

export function getDataTypeSpec(type: DataType): DataTypeSpec {
  switch (type) {
    case DataType.EMBELLISHMENT:
      return { readonly: true };
    default:
      return { readonly: false };
  }
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

export interface ProposalInformation {
  id: number;
  title?: string;
  abstract?: string;
  proposer?: number;
  status?: number;
  created?: string;
  updated?: string;
  users?: any; // TODO implement
  questionary?: ProposalTemplate;
  reviews?: any; // TODO implement
}

export enum ProposalStatus {
  DRAFT = 0,
  SUBMITTED = 1
}
