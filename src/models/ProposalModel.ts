import { DataType } from '../generated/sdk';
// TODO cleanup this class and move functionality to other place

export interface ProposalAnswer {
  proposalQuestionId: string;
  value: string;
  dataType: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}
