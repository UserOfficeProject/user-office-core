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
  public fields!: ProposalTemplateField[];

  private conditionEvalator = new ConditionEvaluator();

  constructor(obj: object | null = null) {
    if (obj !== null) {
      Object.assign(this, obj);
      if (this.fields !== null) {
        this.fields = this.fields.map(x => new ProposalTemplateField(x));
      }
    }
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

export class ProposalTemplateField {
  public proposal_question_id!: string;
  public data_type!: DataType;
  public question!: string;
  public config!: any | { topic: string, variant: string | undefined, small_label:string | undefined, required: boolean | undefined, options:string[] };
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

export enum DataType {
  SMALL_TEXT = "SMALL_TEXT",
  LARGE_TEXT = "LARGE_TEXT",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  FILE_UPLOAD = "FILE_UPLOAD"
}
