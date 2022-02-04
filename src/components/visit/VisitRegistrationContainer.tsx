/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { TemplateGroupId } from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';
import { RegistrationWithQuestionary } from 'models/questionary/visit/VisitRegistrationWithQuestionary';
export interface VisitRegistrationContextType extends QuestionaryContextType {
  state: VisitRegistrationSubmissionState | null;
}

export interface VisitRegistrationContainerProps {
  registration: RegistrationWithQuestionary;
  onSubmitted?: (registration: RegistrationWithQuestionary) => void;
}
export default function VisitRegistrationContainer(
  props: VisitRegistrationContainerProps
) {
  const [initialState] = useState(
    new VisitRegistrationSubmissionState(props.registration)
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.VISIT_REGISTRATION);

  const customEventHandlers = createCustomEventHandlers(
    (state: VisitRegistrationSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
          props.onSubmitted?.(state.registration);
          break;
      }
    }
  );

  const { state, dispatch } = QuestionarySubmissionModel(initialState, [
    eventHandlers,
    customEventHandlers,
  ]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary title={'Visit the facility'} />
    </QuestionaryContext.Provider>
  );
}
