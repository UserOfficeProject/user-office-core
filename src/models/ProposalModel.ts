import { EvaluatorOperator } from "./ConditionEvaluator";
import {
  FieldConfigType,
  BooleanConfig,
  DateConfig,
  EmbellishmentConfig,
  FileUploadConfig,
  SelectionFromOptionsConfig,
  TextInputConfig
} from "../resolvers/types/FieldConfig";
import JSDict from "../utils/Dictionary";

export class ProposalTemplateField {
  constructor(
    public proposal_question_id: string,
    public natural_key: string,
    public data_type: DataType,
    public sort_order: number,
    public question: string,
    public config: typeof FieldConfigType,
    public topic_id: number,
    public dependencies: FieldDependency[] | null
  ) {}

  static fromObject(obj: any) {
    return new ProposalTemplateField(
      obj.proposal_question_id,
      obj.natural_key,
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

export class QuestionaryField extends ProposalTemplateField {
  constructor(templateField: ProposalTemplateField, public value: any) {
    super(
      templateField.proposal_question_id,
      templateField.natural_key,
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
      obj.value
        ? obj.value
        : templateField.data_type === DataType.BOOLEAN
        ? false
        : ""
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

export enum DataType {
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  EMBELLISHMENT = "EMBELLISHMENT",
  FILE_UPLOAD = "FILE_UPLOAD",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  TEXT_INPUT = "TEXT_INPUT"
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

export enum ProposalStatus {
  BLANK = -1,
  DRAFT = 0,
  SUBMITTED = 1
}

export enum ProposalEndStatus {
  UNSET = 0,
  ACCEPTED = 1,
  RESERVED = 2,
  REJECTED = 3
}

export interface ProposalAnswer {
  proposal_question_id: string;
  value: string;
  data_type: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}

const baseDefaultConfig = { required: false, small_label: "", tooltip: "" };
const defaultConfigs = JSDict.Create<
  string,
  | BooleanConfig
  | DateConfig
  | EmbellishmentConfig
  | FileUploadConfig
  | SelectionFromOptionsConfig
  | TextInputConfig
>();
defaultConfigs.put("BooleanConfig", { ...baseDefaultConfig });
defaultConfigs.put("DateConfig", { ...baseDefaultConfig });
defaultConfigs.put("EmbellishmentConfig", {
  plain: "",
  html: "",
  omitFromPdf: false,
  ...baseDefaultConfig
});
defaultConfigs.put("FileUploadConfig", {
  max_files: 1,
  file_type: [],
  ...baseDefaultConfig
});
defaultConfigs.put("SelectionFromOptionsConfig", {
  options: [],
  variant: "radio",
  ...baseDefaultConfig
});
defaultConfigs.put("TextInputConfig", {
  multiline: false,
  placeholder: "",
  ...baseDefaultConfig
});

const f = JSDict.Create<string, () => typeof FieldConfigType>();
f.put(DataType.BOOLEAN, () => new BooleanConfig());
f.put(DataType.DATE, () => new DateConfig());
f.put(DataType.EMBELLISHMENT, () => new EmbellishmentConfig());
f.put(DataType.FILE_UPLOAD, () => new FileUploadConfig());
f.put(DataType.SELECTION_FROM_OPTIONS, () => new SelectionFromOptionsConfig());
f.put(DataType.TEXT_INPUT, () => new TextInputConfig());

export function createConfig<T extends typeof FieldConfigType>(
  config: T,
  init: Partial<T> | string = {}
): T {
  const defaults = defaultConfigs.get(config.constructor.name);
  const initValues = typeof init === "string" ? JSON.parse(init) : init;
  Object.assign(config, { ...defaults, ...initValues });
  return config;
}

export function createConfigByType(dataType: DataType, init: object | string) {
  const config = f.get(dataType)!;
  return createConfig(config(), init);
}
