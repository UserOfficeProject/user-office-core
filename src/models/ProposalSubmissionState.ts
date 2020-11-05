import { Proposal } from 'generated/sdk';

import { QuestionarySubmissionState } from './QuestionarySubmissionState';

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
  | 'submitted'
>;

export interface ProposalSubmissionState extends QuestionarySubmissionState {
  proposal: ProposalSubsetSumbission;
}
