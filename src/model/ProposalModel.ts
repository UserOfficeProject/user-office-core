import { ConditionEvaluator, EvaluatorOperator } from "./ConditionEvaluator";

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
  constructor(public topics: Topic[] = []) {}

  static fromObject(obj: any) {
    return new ProposalTemplate(
      obj.topics
        ? obj.topics.map((topicObj: any) => Topic.fromObject(topicObj))
        : []
    );
  }

  private static conditionEvalator = new ConditionEvaluator();

  public static getTopicById(
    template: ProposalTemplate,
    topicId: number
  ): Topic | undefined {
    return template.topics.find(topic => topic.topic_id === topicId);
  }

  public static addField(
    template: ProposalTemplate,
    field: ProposalTemplateField
  ) {
    const topic = ProposalTemplate.getTopicById(template, field.topic_id);
    if (!topic) {
      return;
    }
    Topic.addField(topic, field);
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
      return needle !== undefined;
    });
    return needle;
  };

  public static getAllFields(
    template: ProposalTemplate
  ): ProposalTemplateField[] {
    let allFields = new Array<ProposalTemplateField>();
    template.topics.forEach(topic => {
      allFields = allFields.concat(topic.fields);
    });
    return allFields;
  }

  public static areDependenciesSatisfied(
    template: ProposalTemplate,
    fieldId: string
  ) {
    const field = ProposalTemplate.getFieldById(template, fieldId);
    if (!field) {
      return true;
    }
    const isAtLeastOneDissasisfied = field.dependencies!.some(dep => {
      let result =
        ProposalTemplate.isDependencySatisfied(template, dep) === false;
      return result;
    });
    return isAtLeastOneDissasisfied === false;
  }

  public static isDependencySatisfied(
    template: ProposalTemplate,
    dependency: FieldDependency
  ): boolean {
    const { condition, params } = dependency.condition;
    const field = ProposalTemplate.getFieldById(
      template,
      dependency.proposal_question_dependency
    );
    if (!field) {
      return true;
    }
    const isParentSattisfied = ProposalTemplate.areDependenciesSatisfied(
      template,
      dependency.proposal_question_dependency
    );
    return (
      isParentSattisfied &&
      ProposalTemplate.conditionEvalator
        .getConfitionEvaluator(condition)
        .isSattisfied(field, params)
    );
  }
}

export class Topic {
  constructor(
    public topic_id: number,
    public topic_title: string,
    public sort_order: number,
    public is_enabled: boolean,
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
      obj.sort_order,
      obj.is_enabled,
      obj.fields
        ? obj.fields.map((field: any) =>
            ProposalTemplateField.fromObject(field)
          )
        : []
    );
  }
}

export class ProposalTemplateField {
  constructor(
    public proposal_question_id: string,
    public data_type: DataType,
    public sort_order: number,
    public question: string,
    public config: FieldConfig,
    public topic_id: number,
    public value: any = "",
    public dependencies: FieldDependency[] | null
  ) {}

  static fromObject(obj: any) {
    return new ProposalTemplateField(
      obj.proposal_question_id,
      obj.data_type,
      obj.sort_order,
      obj.question,
      typeof obj.config == "string" ? JSON.parse(obj.config) : obj.config,
      obj.topic_id,
      obj.value ? JSON.parse(obj.value).value : undefined,
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
  constructor(public condition: EvaluatorOperator, public params: any) {}

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
