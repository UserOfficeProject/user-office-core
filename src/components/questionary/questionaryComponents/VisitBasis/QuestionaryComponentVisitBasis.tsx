import { useContext } from 'react';

import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { VisitRegistrationContextType } from 'components/visit/VisitRegistrationContainer';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

function QuestionaryComponentVisitBasis() {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as VisitRegistrationContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return null;
}

const visitBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const registration = (state as VisitRegistrationSubmissionState)
      .registration;

    let returnValue = state.questionary.questionaryId;
    if (registration.registrationQuestionaryId) {
      // Already has questionary
      return registration.registrationQuestionaryId;
    }

    // create new questionary
    const result = await api.createVisitRegistrationQuestionary({
      visitId: registration.visitId,
    });
    const newRegistration =
      result.createVisitRegistrationQuestionary.registration;

    if (newRegistration?.questionary) {
      dispatch({
        type: 'REGISTRATION_CREATED',
        visit: newRegistration,
      });
      returnValue = newRegistration.questionary.questionaryId;
    }

    return returnValue;
  };

export { QuestionaryComponentVisitBasis, visitBasisPreSubmit };
