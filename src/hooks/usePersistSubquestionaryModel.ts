import { useState } from 'react';

import { prepareAnswers } from '../models/ProposalModelFunctions';
import {
  SubquestionarySubmissionModelState,
  EventType,
  Event,
} from '../models/SubquestionarySubmissionModel';
import { useDataApi } from './useDataApi';

export function usePersistSubquestionaryModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const api = useDataApi();
  const persistModel = ({
    getState,
    dispatch,
  }: {
    getState: () => SubquestionarySubmissionModelState;
    dispatch: React.Dispatch<Event>;
  }) => {
    return (next: Function) => async (action: Event) => {
      next(action);
      const state = getState();
      const questionary = state.questionary;
      switch (action.type) {
        case EventType.SAVE_CLICKED:
          const step = questionary.steps[0];
          setIsLoading(true);
          await api().answerTopic({
            questionaryId: questionary.questionaryId!,
            topicId: step.topic.id,
            answers: prepareAnswers(step.fields),
          });
          setIsLoading(false);
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
