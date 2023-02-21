import {
  Proposal,
  Maybe,
  Call,
  Questionary,
  SampleFragment,
  GenericTemplateFragment,
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
  | 'callId'
  | 'questionaryId'
  | 'submitted'
> & {
  call?: Maybe<
    Pick<
      Call,
      | 'isActive'
      | 'isActiveInternal'
      | 'referenceNumberFormat'
      | 'endCallInternal'
      | 'startCall'
      | 'endCall'
    >
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
