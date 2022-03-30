import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field } from 'formik';
import { DatePicker } from 'formik-mui-lab';
import { useContext } from 'react';
import React from 'react';

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

function QuestionaryComponentVisitBasis({ answer }: BasicComponentProps) {
  const theme = useTheme();
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;
  const { format, mask } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const id = answer.question.id;

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Field
        name={`${id}.startsAt`}
        label="Visit start"
        inputFormat={format}
        mask={mask}
        component={DatePicker}
        inputProps={{ placeholder: format }}
        variant="inline"
        disableToolbar
        autoOk={true}
        required
        textField={{
          fullWidth: true,
          required: true,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(startsAt: Date | null) => {
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
            itemWithQuestionary: { startsAt },
          });
        }}
        // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions  https://stackoverflow.com/a/69986695/5619063
        desktopModeMediaQuery={theme.breakpoints.up('sm')}
      />
      <Field
        name={`${id}.endsAt`}
        label="Visit end"
        inputFormat={format}
        mask={mask}
        component={DatePicker}
        inputProps={{ placeholder: format }}
        variant="inline"
        disableToolbar
        autoOk={true}
        required
        textField={{
          fullWidth: true,
          required: true,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(endsAt: Date | null) => {
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
            itemWithQuestionary: { endsAt },
          });
        }}
        // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions  https://stackoverflow.com/a/69986695/5619063
        desktopModeMediaQuery={theme.breakpoints.up('sm')}
      />
    </LocalizationProvider>
  );
}

const createVisitRegistration = async (api: Sdk, visitId: number) => {
  const { createVisitRegistration } = await api.createVisitRegistration({
    visitId,
  });
  if (createVisitRegistration.registration === null) {
    throw new Error("Couldn't create visit registration");
  }

  return createVisitRegistration.registration;
};

const updateVisitRegistration = async (
  api: Sdk,
  update: UpdateVisitRegistrationMutationVariables
) => {
  const { updateVisitRegistration } = await api.updateVisitRegistration(update);
  if (updateVisitRegistration.registration === null) {
    throw new Error("Couldn't update visit registration");
  }

  return updateVisitRegistration.registration;
};

const visitBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const { registration } = state as VisitRegistrationSubmissionState;

    const isStarted = !!registration.questionary.questionaryId;

    if (isStarted === false) {
      await createVisitRegistration(api, registration.visitId);
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
