import { DataType, Proposal } from '../generated/sdk';

export interface Answer {
  questionId: string;
  value: string;
  dataType: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}

export type ProposalSubsetSumbission = Pick<
  Proposal,
  | 'id'
  | 'abstract'
  | 'proposer'
  | 'questionary'
  | 'status'
  | 'users'
  | 'title'
  | 'shortCode'
  | 'callId'
>;
