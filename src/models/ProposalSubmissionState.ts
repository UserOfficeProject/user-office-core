import { Proposal, Maybe, Call } from 'generated/sdk';

import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export type ProposalSubsetSubmission = Pick<
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
  | 'samples'
> & { call?: Maybe<Pick<Call, 'isActive'>> };

export interface ProposalSubmissionState extends QuestionarySubmissionState {
  proposal: ProposalSubsetSubmission;
}
