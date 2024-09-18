import { Review, Maybe, Call } from 'generated/sdk';

export type FapReviewWithQuestionary = Pick<
  Review,
  | 'id'
  | 'grade'
  | 'comment'
  | 'fapID'
  | 'reviewer'
  | 'status'
  | 'questionary'
  | 'questionaryID'
  | 'questionary'
  | 'proposal'
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
};
