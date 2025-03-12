import { Call, Maybe, TechnicalReview } from 'generated/sdk';

export type TechnicalReviewWithQuestionary = Pick<
  TechnicalReview,
  | 'id'
  | 'comment'
  | 'reviewer'
  | 'status'
  | 'files'
  | 'submitted'
  | 'publicComment'
  | 'questionary'
  | 'questionaryId'
  | 'instrumentId'
  | 'proposalPk'
  | 'proposal'
  | 'reviewerId'
  | 'timeAllocation'
  | 'technicalReviewAssignee'
  | 'technicalReviewAssigneeId'
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
