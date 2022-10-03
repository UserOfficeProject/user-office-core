import {
  Call,
  GenericTemplateFragment,
  Maybe,
  Proposal,
  Questionary,
  SampleFragment,
} from 'generated/sdk';

export type ProposalWithQuestionary = Pick<
  Proposal,
  | 'primaryKey'
  | 'abstract'
  | 'proposer'
  | 'questionary'
  | 'status'
  | 'users'
  | 'title'
  | 'proposalId'
  | 'questionaryId'
  | 'submitted'
> & {
  call: Pick<
    Call,
    'id' | 'isActive' | 'referenceNumberFormat' | 'startCall' | 'endCall'
  >;
} & {
  samples: Maybe<
    (SampleFragment & { questionary: Pick<Questionary, 'isCompleted'> })[]
  >;
} & {
  genericTemplates: Maybe<
    (GenericTemplateFragment & {
      questionary: Pick<Questionary, 'isCompleted'>;
    })[]
  >;
};
