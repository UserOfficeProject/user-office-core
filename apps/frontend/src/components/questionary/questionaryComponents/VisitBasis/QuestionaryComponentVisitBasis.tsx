import { getIn } from 'formik';
import { DateTime } from 'luxon';
import React, { useContext } from 'react';

import DayRangePicker, {
  DayRange,
} from 'components/common/FormikUIDayRangePicker';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { VisitRegistrationContextType } from 'components/visit/VisitRegistrationContainer';
import {
  Sdk,
  SettingsId,
  UpdateVisitRegistrationMutationVariables,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

// `startsAt`/`endsAt` are Luxon DateTimes once edited, but come back as ISO
// strings when the registration is loaded from the backend.
const toDateTime = (value: unknown): DateTime | undefined => {
  if (value instanceof DateTime) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = DateTime.fromISO(value);

    return parsed.isValid ? parsed : undefined;
  }
};

function QuestionaryComponentVisitBasis({
  answer,
  formikProps,
}: BasicComponentProps) {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const id = answer.question.id;

  const startsAtError =
    getIn(formikProps.touched, `${id}.startsAt`) &&
    getIn(formikProps.errors, `${id}.startsAt`);
  const endsAtError =
    getIn(formikProps.touched, `${id}.endsAt`) &&
    getIn(formikProps.errors, `${id}.endsAt`);

  return (
    <DayRangePicker
      id={`${id}.dateRange`}
      label="Visit start and end"
      format={format}
      required
      minDate={DateTime.now()}
      value={{
        from: toDateTime(state.registration.startsAt),
        to: toDateTime(state.registration.endsAt),
      }}
      error={startsAtError || endsAtError || undefined}
      onChange={({ from, to }: DayRange) => {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
          itemWithQuestionary: { startsAt: from, endsAt: to },
        });
      }}
    />
  );
}

const createVisitRegistration = async (
  api: Sdk,
  visitId: number,
  userId: number
) => {
  const { createVisitRegistration } = await api.createVisitRegistration({
    visitId,
    userId,
  });

  return createVisitRegistration;
};

const updateVisitRegistration = async (
  api: Sdk,
  update: UpdateVisitRegistrationMutationVariables
) => {
  const { updateVisitRegistration } = await api.updateVisitRegistration(update);

  return updateVisitRegistration;
};

const visitBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const { registration } = state as VisitRegistrationSubmissionState;

    const isStarted = !!registration.questionary.questionaryId;

    if (isStarted === false) {
      await createVisitRegistration(
        api,
        registration.visitId,
        registration.userId
      );
      const newRegistration = await updateVisitRegistration(api, registration);
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_CREATED',
        itemWithQuestionary: newRegistration,
      });

      return newRegistration.questionary.questionaryId;
    } else {
      const updRegistration = await updateVisitRegistration(api, registration);
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
        itemWithQuestionary: updRegistration,
      });

      return updRegistration.questionary.questionaryId;
    }
  };

export { QuestionaryComponentVisitBasis, visitBasisPreSubmit };
