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
  constructor(
    public fields:ProposalTemplateField[]
    ) {}
  }
  
export class ProposalTemplateField {
  constructor(
    public proposal_question_id:string,
    public data_type:DataType,
    public question:string,
    public config: object | null,
    public dependencies: FieldDependency[] | null
  ) {}
}
  
export class FieldDependency {
  
  constructor(
    public proposal_question_id:string,
    public proposal_question_dependency:string,
    public conditions:string,
  ) {}
}

export enum DataType {
  SMALL_TEXT,
  LARGE_TEXT,
  SELECTION_FROM_OPTIONS,
  BOOLEAN,
  DATE,
  FILE_UPLOAD
}