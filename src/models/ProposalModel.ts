import { Proposal } from 'generated/sdk';

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
  | 'questionaryId'
>;
