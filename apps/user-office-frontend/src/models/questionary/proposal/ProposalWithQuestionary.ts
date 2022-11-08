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
  call?: Maybe<
    Pick<
      Call,
      | 'id'
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
