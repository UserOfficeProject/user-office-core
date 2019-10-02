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
    public questionary?: ProposalTemplate
  ) {}
}

export class ProposalTemplate {
  constructor(
    public topics: Topic[]
    ) {}
  }

export class Topic {
  constructor(
    public topic_id:number,
    public topic_title: string,
    public sort_order:number,
    public fields:ProposalTemplateField[] | null
   ) {}
}
  
export class ProposalTemplateField {
  constructor(
    public proposal_question_id:string,
    public data_type:DataType,
    public sort_order:number,
    public question:string,
    public topic: number | null,
    public config: string | null,
    public dependencies: FieldDependency[] | null,
    public value?:string
  ) {}
}
  
export class FieldDependency {
  
  constructor(
    public proposal_question_id:string,
    public proposal_question_dependency:string,
    public conditions:string,
  ) {}
}

export interface ProposalAnswer {
  proposal_question_id: string;
  data_type:DataType;
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