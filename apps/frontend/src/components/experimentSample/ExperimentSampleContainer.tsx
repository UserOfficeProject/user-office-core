/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { TemplateGroupId } from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import { ExperimentSampleSubmissionState } from 'models/questionary/experimentSample/ExperimentSampleSubmissionState';
import { ExperimentSampleWithQuestionary } from 'models/questionary/experimentSample/ExperimentSampleWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface ExperimentSampleContextType extends QuestionaryContextType {
  state: ExperimentSampleSubmissionState | null;
}

export interface ExperimentSampleContainerProps {
  experimentSample: ExperimentSampleWithQuestionary;
  onUpdate?: (experimentSample: ExperimentSampleWithQuestionary) => void;
  onSubmitted?: (experimentSample: ExperimentSampleWithQuestionary) => void;
}
export default function ExperimentSampleContainer(
  props: ExperimentSampleContainerProps
) {
  const [initialState] = useState(
    new ExperimentSampleSubmissionState(props.experimentSample)
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.SAMPLE_ESI);

  const customEventHandlers = createCustomEventHandlers(
    (state: ExperimentSampleSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          props.onUpdate?.(state.experimentSample);
          break;

        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
          props.onSubmitted?.(state.experimentSample);
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
      <Questionary title={state.experimentSample.sample.title} />
    </QuestionaryContext.Provider>
  );
}
