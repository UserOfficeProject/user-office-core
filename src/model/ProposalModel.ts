import { ConditionEvaluator } from "./ConditionEvaluator";

export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposer: number,
    public status: number,
    public created: string,
    public updated: string
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
  
  public getAllFields():ProposalTemplateField[] {
    return this.fields;
  }

  public getTopicById(topicId:number):Topic | undefined {
    return this.topics.find(topic => topic.topic_id === topicId);
  }

  public areDependenciesSatisfied(fieldId: string) {
    let isAtLeastOneDissasisfied = this.getFieldById(
      fieldId
    ).dependencies!.some(dep => !this.isDependencySatisfied(dep));
    return isAtLeastOneDissasisfied === false;
  }

  public getFieldById = (questionId: string) =>
    this.fields.find(field => field.proposal_question_id === questionId)!;

  private isDependencySatisfied(dependency: FieldDependency): boolean {
    let { condition, params } = JSON.parse(dependency.condition);
    let field = this.getFieldById(dependency.proposal_question_dependency);
    return this.conditionEvalator
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
  public config!: any | { variant: string | undefined, small_label:string | undefined, required: boolean | undefined, options:string[] };
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

export class ProposalTemplateResult {
  template!: ProposalTemplate;
  error!: String;
}

export interface ProposalAnswer {
  proposal_question_id: string;
  answer: string;
}

export enum DataType {
  TEXT_INPUT = "TEXT_INPUT",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  FILE_UPLOAD = "FILE_UPLOAD"
}
