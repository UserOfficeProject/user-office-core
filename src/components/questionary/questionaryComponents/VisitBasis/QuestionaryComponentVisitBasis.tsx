import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Field } from 'formik';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import { useContext } from 'react';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { VisitRegistrationContextType } from 'components/visit/VisitRegistrationContainer';
import { Sdk, UpdateVisitRegistrationMutationVariables } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

const DatePicker = (props: Record<string, unknown>) => (
  <Field
    format="yyyy-MM-dd"
    component={KeyboardDatePicker}
    margin="normal"
    variant="inline"
    disableToolbar
    autoOk={true}
    fullWidth
    required
    InputLabelProps={{
      shrink: true,
    }}
    {...props}
  />
);

function QuestionaryComponentVisitBasis({ answer }: BasicComponentProps) {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const id = answer.question.id;

  return (
    <MuiPickersUtilsProvider utils={LuxonUtils}>
      <DatePicker
        name={`${id}.startsAt`}
        label="Visit start"
        required
        onChange={(startsAt: MaterialUiPickersDate) => {
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
            itemWithQuestionary: { startsAt },
          });
        }}
      />
      <DatePicker
        name={`${id}.endsAt`}
        label="Visit end"
        required
        onChange={(endsAt: MaterialUiPickersDate) => {
          dispatch({
            type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
            itemWithQuestionary: { endsAt },
          });
        }}
      />
    </MuiPickersUtilsProvider>
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
