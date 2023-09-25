import { useContext } from 'react';

import { FeedbackContextType } from 'components/feedback/FeedbackContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { FeedbackSubmissionState } from 'models/questionary/feedback/FeedbackSubmissionState';

function QuestionaryComponentFeedbackBasis() {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as FeedbackContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return null;
}

const feedbackBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const feedback = (state as FeedbackSubmissionState).feedback;

    const isCreated = feedback.id !== 0;
    if (isCreated) {
      // return existing questionary id
      return feedback.questionaryId;
    }

    // create new feedback and return new questionary id
    const { createFeedback } = await api.createFeedback({
      scheduledEventId: feedback.scheduledEventId,
    });

    dispatch({
      type: 'ITEM_WITH_QUESTIONARY_CREATED',
      itemWithQuestionary: createFeedback,
    });

    return createFeedback.questionary.questionaryId;
  };

export { QuestionaryComponentFeedbackBasis, feedbackBasisPreSubmit };
