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
import { VisitRegistrationStatus } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { VisitRegistrationContextType } from './VisitRegistrationContainer';

type VisitRegistrationReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function VisitRegistrationReview({ confirm }: VisitRegistrationReviewProps) {
  const { toFormattedDateTime } = useFormattedDateTime();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const registration = state.registration;

  const additionalDetails: TableRowData[] = [
    {
      label: 'Status',
      value: registration.status,
    },
    {
      label: 'Start date',
      value: toFormattedDateTime(registration.startsAt),
    },
    {
      label: 'End date',
      value: toFormattedDateTime(registration.endsAt),
    },
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
                const { submitVisitRegistration } =
                  await api().SubmitVisitRegistration({
                    visitId: state.registration.visitId,
                    userId: state.registration.userId,
                  });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: submitVisitRegistration,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                  itemWithQuestionary: submitVisitRegistration,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after visit submission.',
              }
            )()
          }
          disabled={registration.status !== VisitRegistrationStatus.DRAFTED}
          data-cy="submit-visit-registration-button"
        >
          {registration.status === VisitRegistrationStatus.DRAFTED
            ? 'Submit'
            : '✔ Submitted'}
        </NavigButton>
      </NavigationFragment>
    </div>
  );
}

export default withConfirm(VisitRegistrationReview);
