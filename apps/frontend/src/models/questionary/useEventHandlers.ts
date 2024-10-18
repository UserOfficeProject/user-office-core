import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { useDataApi } from 'hooks/common/useDataApi';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import { TemplateGroupId } from './../../generated/sdk';
import {
  Event,
  QuestionarySubmissionState,
} from './QuestionarySubmissionState';

const isNotCreated = (state: QuestionarySubmissionState) =>
  state.getItemId() === 0;

export default function useEventHandlers(templateGroupId: TemplateGroupId) {
  const api = useDataApi();

  const eventHandlers = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    const handleReset = async (): Promise<boolean> => {
      const state = getState();

      if (isNotCreated(state)) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_LOADED',
          itemWithQuestionary: state.initItem,
        });
      } else {
        const def = getQuestionaryDefinition(templateGroupId);
        await def
          .getItemWithQuestionary(api(), state.getItemId())
          .then((itemWithQuestionary) => {
            if (!itemWithQuestionary) {
              return false;
            }
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_LOADED',
              itemWithQuestionary,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: itemWithQuestionary.questionary.steps,
              stepIndex: state.stepIndex,
            });
          });
      }

      return true;
    };

    return (next: FunctionType) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState();
      switch (action.type) {
        case 'BACK_CLICKED':
          if (state.isDirty) {
            action.confirm?.(
              async () => {
                await handleReset();
                dispatch({ type: 'CLEAR_DELETE_LIST' });
                dispatch({ type: 'GO_STEP_BACK' });
              },
              {
                title: 'Confirmation',
                description:
                  'You have made changes in this step, which will be discarded. Are you sure?',
              }
            )();
          } else {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          await handleReset();
          break;

        case 'GO_TO_STEP_CLICKED':
          if (!state.isDirty) {
            await handleReset();
            dispatch({
              type: 'GO_TO_STEP',
              stepIndex: action.stepIndex,
            });
          } else {
            action.confirm?.(
              async () => {
                await handleReset();
                dispatch({
                  type: 'GO_TO_STEP',
                  stepIndex: action.stepIndex,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'Changes you recently made in this step will not be saved! Are you sure?',
              }
            )();
          }
          break;
      }
    };
  };

  return eventHandlers;
}
