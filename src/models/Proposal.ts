import { User } from "./User";
import { Review } from "./Review";

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

export class ProposalInformation {
  constructor(
    public id: number,
    public title?: string,
    public abstract?: string,
    public proposer?: number,
    public status?: number,
    public created?: string,
    public updated?: string,
    public users?: User[],
    public reviews?: Review[],
    public questionary?: Questionary
  ) {}
}

export class ProposalTemplate {
  constructor(public topics: Topic[]) {}
}

export class Questionary {
  constructor(public steps: QuestionaryStep[]) {}
}

export class Topic {
  constructor(
    public topic_id: number,
    public topic_title: string,
    public isEnabled: boolean,
    public sort_order: number,
    public fields: ProposalTemplateField[] | null
  ) {}
}

export class QuestionaryStep {
  constructor(
    public topic: Topic,
    public isCompleted: boolean,
    public fields: QuestionaryField[]
  ) {}
}

export class ProposalTemplateField {
  constructor(
    public proposal_question_id: string,
    public data_type: DataType,
    public sort_order: number,
    public question: string,
    public topic_id: number | null,
    public config: string | null,
    public dependencies: FieldDependency[] | null
  ) {}
}

export class QuestionaryField extends ProposalTemplateField {
  constructor(
    proposal_question_id: string,
    data_type: DataType,
    sort_order: number,
    question: string,
    topic_id: number | null,
    config: string | null,
    dependencies: FieldDependency[] | null,
    public value: string
  ) {
    super(
      proposal_question_id,
      data_type,
      sort_order,
      question,
      topic_id,
      config,
      dependencies
    );
  }
}

export class FieldDependency {
  constructor(
    public proposal_question_id: string,
    public proposal_question_dependency: string,
    public condition: string
  ) {}
}

export interface ProposalAnswer {
  proposal_question_id: string;
  data_type: DataType;
  value: string;
}

export enum DataType {
  TEXT_INPUT = "TEXT_INPUT",
  SELECTION_FROM_OPTIONS = "SELECTION_FROM_OPTIONS",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  FILE_UPLOAD = "FILE_UPLOAD",
  EMBELLISHMENT = "EMBELLISHMENT"
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
