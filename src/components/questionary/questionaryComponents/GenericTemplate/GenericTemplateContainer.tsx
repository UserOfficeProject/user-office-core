/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { TemplateGroupId } from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import { GenericTemplateSubmissionState } from 'models/questionary/genericTemplate/GenericTemplateSubmissionState';
import { GenericTemplateWithQuestionary } from 'models/questionary/genericTemplate/GenericTemplateWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface GenericTemplateContextType extends QuestionaryContextType {
  state: GenericTemplateSubmissionState | null;
}

export function GenericTemplateContainer(props: {
  genericTemplate: GenericTemplateWithQuestionary;
  genericTemplateCreated?: (
    genericTemplate: GenericTemplateWithQuestionary
  ) => void;
  genericTemplateUpdated?: (
    genericTemplate: GenericTemplateWithQuestionary
  ) => void;
  genericTemplateEditDone?: () => void;
  title: string;
}) {
  const [initialState] = useState(
    new GenericTemplateSubmissionState(props.genericTemplate)
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.GENERIC_TEMPLATE);

  const customEventHandlers = createCustomEventHandlers(
    (state: GenericTemplateSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          props.genericTemplateUpdated?.({
            ...state.genericTemplate,
            ...action.itemWithQuestionary,
          });
          break;
        case 'ITEM_WITH_QUESTIONARY_CREATED':
          props.genericTemplateCreated?.(state.genericTemplate);
          break;
        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
          props.genericTemplateEditDone?.();
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
      <Questionary title={state.genericTemplate.title || props.title} />
    </QuestionaryContext.Provider>
  );
}
