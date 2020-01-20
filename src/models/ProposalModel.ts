import { DataType } from "../generated/sdk";
// TODO cleanup this class and move functionality to other place

export interface ProposalAnswer {
  proposal_question_id: string;
  value: string;
  data_type: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}
