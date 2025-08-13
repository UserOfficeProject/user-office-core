import { Save } from '@mui/icons-material';
import { Field, Form, Formik } from 'formik';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  SettingsId,
  SubmitTechnicalReviewInput,
  UserRole,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { isCallEnded } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TechnicalReviewContextType } from './TechnicalReviewQuestionary';
import TechnicalReviewQuestionaryReview from './TechnicalReviewQuestionaryReview';

type TechnicalReviewSummaryProps = {
  confirm: WithConfirmType;
};

function TechnicalReviewSummary({ confirm }: TechnicalReviewSummaryProps) {
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as TechnicalReviewContextType;

  if (!dispatch || !state) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const isFapChairOrSec = useCheckAccess([
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { isInternalUser } = useContext(UserContext);
  const { user } = useContext(UserContext);
  const callHasEnded = isCallEnded(
    state.technicalReview.proposal?.call?.startCall,
    state.technicalReview.proposal?.call?.endCall
  );
  const isCallActiveInternal =
    state.technicalReview.call?.isActiveInternal ?? true;
  const [loadingSubmitMessage, setLoadingSubmitMessage] =
    useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settingsMap } = useContext(SettingsContext);

  const [submitButtonMessage, setSubmitButtonMessage] = useState<string>(
    'I am aware that no further edits can be made after review submission.'
  );

  const technicalReview = state.technicalReview;

  const allStepsComplete =
    technicalReview.questionary &&
    technicalReview.questionary.steps.every((step) => step.isCompleted);

  const fapSecOrChairCanEdit =
    isFapChairOrSec &&
    settingsMap.get(SettingsId.FAP_SECS_EDIT_TECH_REVIEWS)?.settingsValue ===
      'true';

  const [submitDisabled, setSubmitDisabled] = useState(() => {
    let submissionDisabled =
      (!isUserOfficer && callHasEnded) || // disallow submit for non user officers if the call ended
      !allStepsComplete ||
      technicalReview.submitted;

    if (
      technicalReview.submitted &&
      submissionDisabled &&
      isInternalUser &&
      isCallActiveInternal &&
      allStepsComplete
    ) {
      submissionDisabled = false; // allow submit for internal users if the call ended
    }
    if (isInstrumentScientist) {
      //reviewers should not be able to submit a grade for proposals on which they are not a reviewer
      submissionDisabled =
        technicalReview.technicalReviewAssignee?.id !== user.id ? true : false;
    }

    return submissionDisabled;
  });

  useEffect(() => {
    async function initializeSubmissionMessage() {
      if (!technicalReview.proposal?.callId || submitDisabled) {
        setLoadingSubmitMessage(false);

        return;
      }

      setSubmitButtonMessage(
        'I am aware that no further changes to the technical review are possible after submission.'
      );
      setLoadingSubmitMessage(false);
    }
    initializeSubmissionMessage();
  }, [api, submitDisabled]);

  if (loadingSubmitMessage) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const initialValues = {
    submitted: technicalReview.submitted,
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    ((isSubmitting || technicalReview.submitted) &&
      !(isUserOfficer || fapSecOrChairCanEdit)) ||
    isInternalReviewer;

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={async () => {}}
        enableReinitialize={true}
      >
        <Form>
          <TechnicalReviewQuestionaryReview data={technicalReview} />
          <NavigationFragment isLoading={isSubmitting}>
            {(isUserOfficer || isFapChairOrSec) && (
              <Field
                id="submitted"
                name="submitted"
                component={CheckboxWithLabel}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: {
                      submitted: evt.target.checked ? true : false,
                    },
                  });
                }}
                disabled={isSubmitting}
                type="checkbox"
                Label={{
                  label: 'Submitted',
                }}
                data-cy="is-review-submitted"
              />
            )}
            <NavigButton
              data-cy="back-button"
              onClick={() => dispatch({ type: 'BACK_CLICKED' })}
              disabled={state.stepIndex === 0}
              isBusy={isSubmitting}
            >
              Back
            </NavigButton>
            {isUserOfficer && (
              <NavigButton
                data-cy="save-button"
                disabled={
                  shouldDisableForm(isSubmitting) ||
                  (fapSecOrChairCanEdit && isSubmitting)
                }
                color={'primary'}
                type="submit"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const { addTechnicalReview } = await api({
                      toastSuccessMessage: 'Updated',
                    }).addTechnicalReview({
                      proposalPk: state.technicalReview.proposalPk,
                      timeAllocation: +(
                        state.technicalReview.timeAllocation || 0
                      ),
                      comment: state.technicalReview.comment,
                      publicComment: state.technicalReview.publicComment,
                      status: state.technicalReview.status,
                      submitted: state.technicalReview.submitted,
                      reviewerId: user.id,
                      files: state.technicalReview.files,
                      instrumentId: state.technicalReview.instrumentId,
                      questionaryId: state.technicalReview.questionaryId,
                    });

                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                      itemWithQuestionary: addTechnicalReview,
                    });
                    dispatch({
                      type: 'CLEAN_DIRTY_STATE',
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                startIcon={<Save />}
              >
                Save
              </NavigButton>
            )}
            {!(isUserOfficer || fapSecOrChairCanEdit) && (
              <NavigButton
                onClick={() => {
                  confirm(
                    async () => {
                      setIsSubmitting(true);
                      try {
                        const submittedTechnicalReview = {
                          proposalPk: state.technicalReview.proposalPk,
                          timeAllocation: +(
                            state.technicalReview.timeAllocation || 0
                          ),
                          comment: state.technicalReview.comment,
                          publicComment: state.technicalReview.publicComment,
                          status: state.technicalReview.status,
                          submitted: true,
                          reviewerId: user.id,
                          files: state.technicalReview.files,
                          instrumentId: state.technicalReview.instrumentId,
                          questionaryId: state.technicalReview.questionaryId,
                        };

                        const submittedTechnicalReviewsInput: SubmitTechnicalReviewInput[] =
                          [submittedTechnicalReview];

                        await api({
                          toastSuccessMessage:
                            'Your review has been submitted successfully.',
                        }).submitTechnicalReviews({
                          technicalReviews: submittedTechnicalReviewsInput,
                        });

                        dispatch({
                          type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                          itemWithQuestionary: submittedTechnicalReview,
                        });
                        dispatch({
                          type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                          itemWithQuestionary: submittedTechnicalReview,
                        });
                        dispatch({
                          type: 'CLEAN_DIRTY_STATE',
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
                disabled={
                  isSubmitting ||
                  technicalReview.submitted ||
                  isInternalReviewer ||
                  submitDisabled
                }
                isBusy={isSubmitting}
                data-cy="button-submit-technical-review"
              >
                {technicalReview.submitted ? '✔ Submitted' : 'Submit'}
              </NavigButton>
            )}
          </NavigationFragment>
        </Form>
      </Formik>
    </>
  );
}

export default withConfirm(TechnicalReviewSummary);
