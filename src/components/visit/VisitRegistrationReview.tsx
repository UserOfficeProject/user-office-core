import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { VisitRegistrationContextType } from './VisitRegistrationContainer';

type VisitRegistrationReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function VisitRegistrationReview({ confirm }: VisitRegistrationReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.registration.isRegistrationSubmitted;

  const additionalDetails: TableRowData[] = [
    { label: 'Status', value: isSubmitted ? 'Submitted' : 'Draft' },
  ];

  return (
    <div>
      <QuestionaryDetails
        questionaryId={state.registration.registrationQuestionaryId!}
        additionalDetails={additionalDetails}
        title="Visit information"
      />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const result = await api().updateVisitRegistration({
                  visitId: state.registration.visitId,
                  isRegistrationSubmitted: true,
                });
                if (!result.updateVisitRegistration.registration) {
                  return;
                }
                dispatch({
                  type: 'REGISTRATION_MODIFIED',
                  visit: result.updateVisitRegistration.registration,
                });
                dispatch({
                  type: 'REGISTRATION_SUBMITTED',
                  visit: result.updateVisitRegistration.registration,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after visit submission.',
              }
            )()
          }
          disabled={isSubmitted}
          variant="contained"
          color="primary"
          data-cy="submit-visit-registration-button"
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </div>
  );
}

export default withConfirm(VisitRegistrationReview);
