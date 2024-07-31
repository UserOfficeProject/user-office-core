import React, { useContext, useEffect, useState } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { UserContext } from 'context/UserContextProvider';
import { ReviewStatus, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { isCallEnded } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ReviewContextType } from './ReviewQuestionary';
import ReviewQuestionaryReview from './ReviewQuestionaryReview';

type ReviewSummaryProps = {
  confirm: WithConfirmType;
};

function ReviewReview({ confirm }: ReviewSummaryProps) {
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ReviewContextType;

  if (!dispatch || !state) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { isInternalUser } = useContext(UserContext);
  const callHasEnded = isCallEnded(
    state.fapReview.proposal?.call?.startCall,
    state.fapReview.proposal?.call?.endCall
  );
  const isCallActiveInternal = state.fapReview?.call?.isActiveInternal ?? true;
  const [loadingSubmitMessage, setLoadingSubmitMessage] =
    useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonMessage, setSubmitButtonMessage] = useState<string>(
    'I am aware that no further edits can be made after review submission.'
  );

  const fapReview = state.fapReview;

  const allStepsComplete =
    fapReview.questionary &&
    fapReview.questionary.steps.every((step) => step.isCompleted);

  const [submitDisabled, setSubmitDisabled] = useState(() => {
    const submissionDisabled =
      (!isUserOfficer && callHasEnded) || // disallow submit for non user officers if the call ended
      !allStepsComplete ||
      fapReview.status === ReviewStatus.SUBMITTED;

    if (
      fapReview.status !== ReviewStatus.SUBMITTED &&
      submissionDisabled &&
      isInternalUser &&
      isCallActiveInternal &&
      allStepsComplete
    ) {
      return false; // allow submit for intenal users if the call ended
    }

    return submissionDisabled;
  });

  useEffect(() => {
    async function initializeSubmissionMessage() {
      if (!fapReview.proposal?.callId || submitDisabled) {
        setLoadingSubmitMessage(false);

        return;
      }

      setSubmitButtonMessage(
        'I am aware that no further changes to the grade are possible after submission.'
      );
      setLoadingSubmitMessage(false);
    }
    initializeSubmissionMessage();
  }, [api, submitDisabled]);

  if (loadingSubmitMessage) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      <ReviewQuestionaryReview data={fapReview} />
      <NavigationFragment
        //disabled={fapReview.status === ReviewStatus.DRAFT}
        isLoading={isSubmitting}
      >
        <NavigButton
          onClick={() => dispatch({ type: 'BACK_CLICKED' })}
          disabled={state.stepIndex === 0}
          isBusy={isSubmitting}
        >
          Back
        </NavigButton>
        <NavigButton
          onClick={() => {
            confirm(
              async () => {
                setIsSubmitting(true);
                try {
                  const { updateReview } = await api({
                    toastSuccessMessage:
                      'Your review has been submitted successfully. You will receive a confirmation email soon.',
                  }).updateReview({
                    reviewID: state.fapReview.id,
                    grade: state.fapReview.grade || 0,
                    comment: state.fapReview.comment || '',
                    status: ReviewStatus.SUBMITTED,
                    fapID: state.fapReview.fapID,
                    questionaryID: state.fapReview.questionaryID,
                  });

                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: updateReview,
                  });
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                    itemWithQuestionary: updateReview,
                  });
                } finally {
                  setSubmitDisabled(true);
                  setIsSubmitting(false);
                }
              },
              {
                title: 'Please confirm',
                description: submitButtonMessage,
              }
            )();
          }}
          disabled={submitDisabled}
          isBusy={isSubmitting}
          data-cy="button-submit-proposal"
        >
          {fapReview.status === ReviewStatus.SUBMITTED
            ? '✔ Submitted'
            : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ReviewReview);
