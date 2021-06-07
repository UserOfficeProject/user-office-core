import { Proposal, Maybe, Call } from 'generated/sdk';

import { SampleFragment, Questionary } from './../generated/sdk';
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
> & { call?: Maybe<Pick<Call, 'isActive'>> } & {
  samples: Maybe<
    (SampleFragment & { questionary: Pick<Questionary, 'isCompleted'> })[]
  >;
};

export interface ProposalSubmissionState extends QuestionarySubmissionState {
  proposal: ProposalSubsetSubmission;
}
