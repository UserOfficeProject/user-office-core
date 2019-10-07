import { ConditionEvaluator } from "./ConditionEvaluator";

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
  public topics: Topic[] = [];
  private fields: ProposalTemplateField[] = []; // reference to all fields for quick lookup
  
  private conditionEvalator = new ConditionEvaluator();
  
  constructor(obj: object | null = null) {
    if (obj !== null) {
      Object.assign(this, obj);
      if (this.topics !== null) {
        this.topics = this.topics.map(x => new Topic(x));
        this.topics.forEach(topic => topic.fields && (this.fields = this.fields.concat(topic.fields)));
      }
    }
  }

  public addField(field:ProposalTemplateField):void {
    this.getTopicById(field.topic_id)!.fields.unshift(field);
    this.fields.unshift(field);
  }
  
  public getAllFields():ProposalTemplateField[] {
    return this.fields;
  }

  public getTopicById(topicId:number):Topic | undefined {
    return this.topics.find(topic => topic.topic_id === topicId);
  }

  public areDependenciesSatisfied(fieldId: string) {
    const isAtLeastOneDissasisfied = this.getFieldById(
      fieldId
    ).dependencies!.some(dep => !this.isDependencySatisfied(dep));
    return isAtLeastOneDissasisfied === false;
  }

  public getFieldById = (questionId: string) =>
    this.fields.find(field => field.proposal_question_id === questionId)!;

  private isDependencySatisfied(dependency: FieldDependency): boolean {
    const { condition, params } = JSON.parse(dependency.condition);
    const field = this.getFieldById(dependency.proposal_question_dependency);
    const isParentSattisfied = this.areDependenciesSatisfied(dependency.proposal_question_dependency);
    return isParentSattisfied &&
      this.conditionEvalator
      .getConfitionEvaluator(condition)
      .isSattisfied(field, params);
  }
}

export class Topic {
  constructor(obj: object | null = null) {
    if (obj !== null) {
      Object.assign(this, obj);
      if (this.fields !== null) {
        this.fields = this.fields.map(x => new ProposalTemplateField(x));
      }
    }
  }
  public topic_id!:number;
  public topic_title!: string;
  public fields!:ProposalTemplateField[];

  public getFieldById = (questionId: string) =>
    this.fields && this.fields.find(field => field.proposal_question_id === questionId)!;

}

export class ProposalTemplateField {
  public proposal_question_id!: string;
  public data_type!: DataType;
  public question!: string;
  public config!: FieldConfig;
  public topic_id!: number;
  public value: any = "";
  public dependencies!: FieldDependency[] | null;

  constructor(obj: object | null = null) {
    if (obj != null) {
      Object.assign(this, obj);
      if (this.dependencies != null) {
        this.dependencies = this.dependencies.map(x => new FieldDependency(x));
      }
      if (typeof this.config == "string") {
        this.config = JSON.parse(this.config);
      }
      if (typeof this.value == "string") {
        try {
          this.value = JSON.parse(this.value).value;
        }
        catch(e) {}
      }
      else {
        this.value = "";
      }
    }
  }
}

export class FieldDependency {
  public proposal_question_id!: string;
  public proposal_question_dependency!: string;
  public condition!: string;

  constructor(obj: object | null = null) {
    if (obj != null) {
      Object.assign(this, obj);
    }
  }
}

export interface ProposalAnswer {
  proposal_question_id: string;
  value: boolean | number | string;
  data_type: DataType;
}

export enum DataType {
  TEXT_INPUT = "TEXT_INPUT",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  FILE_UPLOAD = "FILE_UPLOAD",
  EMBELLISHMENT = "EMBELLISHMENT"
}

export interface DataTypeSpec {
  readonly:boolean;
}

export function getDataTypeSpec(type:DataType):DataTypeSpec {
  switch(type) {
    case DataType.EMBELLISHMENT:
      return {readonly:true};
    default:
      return {readonly:false};   
  }
}

export interface FieldConfig {
  variant?: string, 
  small_label?:string;
  required?: boolean;
  options?:string[];
  file_type?:string;
  max_files?:number;
  multiline?:boolean;
  min?:number;
  max?:number;
  placeholder?:string;
  html?:string;
  plain?:string;
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
  reviews?: any // TODO implement
}

export enum ProposalStatus {
  DRAFT = 0,
  SUBMITTED = 1
}
