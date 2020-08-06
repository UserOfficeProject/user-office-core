import { prepareAnswers } from 'models/ProposalModelFunctions';
import {
  Event,
  EventType,
  SubquestionarySubmissionModelState,
} from 'models/SubquestionarySubmissionModel';
import { useState } from 'react';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

export function usePersistSubquestionaryModel() {
  const [isSavingModel, setIsSavingModel] = useState<boolean>(false);
  const { api } = useDataApiWithFeedback();
  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<SubquestionarySubmissionModelState, Event>) => {
    const reducer = (next: Function) => async (action: Event) => {
      next(action);
      const state = getState();
      const questionary = state.questionary;
      switch (action.type) {
        case EventType.SAVE_CLICKED:
          const step = questionary.steps[0];
          setIsSavingModel(true);
          await api('Sample updated').answerTopic({
            questionaryId: questionary.questionaryId as number,
            topicId: step.topic.id,
            answers: prepareAnswers(step.fields),
          });
          setIsSavingModel(false);
          dispatch({ type: EventType.MODEL_SAVED });
          break;
      }
    };

    return reducer;
  };

  return { isSavingModel, persistModel };
}
