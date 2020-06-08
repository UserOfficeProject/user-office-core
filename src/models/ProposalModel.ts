import { DataType } from '../generated/sdk';

export interface ProposalAnswer {
  proposalQuestionId: string;
  value: string;
  dataType: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}
