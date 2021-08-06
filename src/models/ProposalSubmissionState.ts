import { immerable } from 'immer';

import { Proposal, Maybe, Call } from 'generated/sdk';

import { SampleFragment, Questionary } from './../generated/sdk';
import {
  QuestionarySubmissionState,
  WizardStep,
} from './QuestionarySubmissionState';

export type ProposalSubsetSubmission = Pick<
  Proposal,
  | 'primaryKey'
  | 'abstract'
  | 'proposer'
  | 'questionary'
  | 'status'
  | 'users'
  | 'title'
  | 'proposalId'
  | 'callId'
  | 'questionaryId'
  | 'submitted'
> & { call?: Maybe<Pick<Call, 'isActive'>> } & {
  samples: Maybe<
    (SampleFragment & { questionary: Pick<Questionary, 'isCompleted'> })[]
  >;
};

export class ProposalSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public proposal: ProposalSubsetSubmission,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.proposal;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.proposal = { ...this.proposal, ...item };
  }
}
