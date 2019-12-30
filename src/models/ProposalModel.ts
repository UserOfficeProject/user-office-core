import { BasicUserDetails } from "./User";
import { Review } from "./Review";
import { EvaluatorOperator } from "./ConditionEvaluator";
import { ObjectType, Field, Int, registerEnumType } from "type-graphql";

@ObjectType()
export class ProposalTemplateField {
  @Field()
  public proposal_question_id: string;

  @Field()
  public data_type: DataType;

  @Field(() => Int)
  public sort_order: number;

  @Field()
  public question: string;
  //public config: FieldConfig, // TODO strongly type this after making GraphQL accept union type configs

  @Field()
  public config: string;

  @Field(() => Int)
  public topic_id: number;

  @Field(() => [FieldDependency], { nullable: true })
  public dependencies: FieldDependency[] | null;

  constructor(
    proposal_question_id: string,
    data_type: DataType,
    sort_order: number,
    question: string,
    config: string,
    topic_id: number,
    dependencies: FieldDependency[] | null
  ) {
    this.proposal_question_id = proposal_question_id;
    this.data_type = data_type;
    this.sort_order = sort_order;
    this.question = question;
    this.config = config;
    this.topic_id = topic_id;
    this.dependencies = dependencies;
  }

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

@ObjectType()
export class QuestionaryField extends ProposalTemplateField {
  @Field(() => String)
  public value: any;
  constructor(templateField: ProposalTemplateField, value: any) {
    super(
      templateField.proposal_question_id,
      templateField.data_type,
      templateField.sort_order,
      templateField.question,
      templateField.config,
      templateField.topic_id,
      templateField.dependencies
    );
    this.value = value;
  }
  static fromObject(obj: any) {
    const templateField = ProposalTemplateField.fromObject(obj);
    return new QuestionaryField(
      templateField,
      obj.value
        ? JSON.parse(obj.value).value
        : templateField.data_type === DataType.BOOLEAN
        ? false
        : ""
    );
  }
}

@ObjectType()
export class Questionary {
  @Field()
  public a: string;

  @Field(() => [QuestionaryStep])
  public steps: QuestionaryStep[];
  constructor(steps: QuestionaryStep[]) {
    this.steps = steps;
  }

  static fromObject(obj: any): Questionary {
    return new Questionary(
      obj.steps
        ? obj.steps.map((stepObj: any) => QuestionaryStep.fromObject(stepObj))
        : []
    );
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

registerEnumType(DataType, {
  name: "DataType"
});

@ObjectType()
export class Topic {
  @Field(type => Int)
  public topic_id: number; // TODO fix casing. Use CamelCasing

  @Field()
  public topic_title: string;

  @Field(type => Int)
  public sort_order: number;

  @Field()
  public is_enabled: boolean;

  constructor(
    topic_id: number,
    topic_title: string,
    sort_order: number,
    is_enabled: boolean
  ) {
    this.topic_id = topic_id;
    this.topic_title = topic_title;
    this.sort_order = sort_order;
    this.is_enabled = is_enabled;
  }

  public static fromObject(obj: any) {
    return new Topic(
      obj.topic_id,
      obj.topic_title,
      obj.sort_order,
      obj.is_enabled
    );
  }
}

@ObjectType()
export class ProposalTemplate {
  @Field(type => TemplateStep)
  public steps: TemplateStep[] = [];
  constructor(steps: TemplateStep[]) {
    this.steps = steps;
  }

  static fromObject(obj: any) {
    return new ProposalTemplate(
      obj.steps
        ? obj.steps.map((stepObj: any) => TemplateStep.fromObject(stepObj))
        : []
    );
  }
}

@ObjectType()
export class TemplateStep {
  @Field(type => Topic)
  public topic: Topic;

  @Field(type => [ProposalTemplateField])
  public fields: ProposalTemplateField[];

  constructor(topic: Topic, fields: ProposalTemplateField[]) {
    this.topic = topic;
    this.fields = fields;
  }

  public static fromObject(obj: any) {
    return new TemplateStep(
      Topic.fromObject(obj.topic),
      obj.fields.map((field: any) => ProposalTemplateField.fromObject(field))
    );
  }
}

@ObjectType()
export class QuestionaryStep {
  @Field(() => Topic)
  public topic: Topic;
  @Field()
  public isCompleted: boolean;
  @Field(() => QuestionaryField)
  public fields: QuestionaryField[];

  constructor(topic: Topic, isCompleted: boolean, fields: QuestionaryField[]) {
    this.topic = topic;
    this.isCompleted = isCompleted;
    this.fields = fields;
  }
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

@ObjectType()
export class FieldDependency {
  @Field()
  public proposal_question_id: string;

  @Field()
  public proposal_question_dependency: string;
  //public condition: FieldCondition

  @Field(() => String, { nullable: true })
  public condition: string; // TODO SWAP-341. strongly type this after making GraphQL able to return more custom objects

  constructor(
    proposal_question_id: string,
    proposal_question_dependency: string,
    condition: string
  ) {
    this.proposal_question_id = proposal_question_id;
    this.proposal_question_dependency = proposal_question_dependency;
    this.condition = condition;
  }

  static fromObject(obj: any) {
    return new FieldDependency(
      obj.proposal_question_id,
      obj.proposal_question_dependency,
      /*typeof obj.condition == "string"
        ? JSON.parse(obj.condition)
        : obj.condition
        */
      obj.condition // TODO SWAP-341. strongly type this after making GraphQL able to return more custom objects
    );
  }
}

export class FieldCondition {
  constructor(public condition: EvaluatorOperator, public params: any) {}

  static fromObject(obj: any) {
    return new FieldCondition(obj.condition, obj.params);
  }
}

export enum ProposalStatus {
  BLANK = -1,
  DRAFT = 0,
  SUBMITTED = 1
}

registerEnumType(ProposalStatus, { name: "ProposalStatus" });

export interface ProposalAnswer {
  proposal_question_id: string;
  value: string;
  data_type: DataType;
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
  tooltip?: string;
  omitFromPdf?: boolean;
}
