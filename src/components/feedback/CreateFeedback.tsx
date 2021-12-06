import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  QuestionaryStep,
  TemplateGroupId,
} from 'generated/sdk';
import { FeedbackCore } from 'models/questionary/feedback/FeedbackCore';
import { FeedbackWithQuestionary } from 'models/questionary/feedback/FeedbackWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import FeedbackContainer from './FeedbackContainer';

function createFeedbackStub(
  scheduledEventId: number,
  templateId: number,
  creatorId: number,
  questionarySteps: QuestionaryStep[]
): FeedbackWithQuestionary {
  return {
    id: 0,
    scheduledEventId: scheduledEventId,
    status: FeedbackStatus.DRAFT,
    questionaryId: 0,
    creatorId: creatorId,
    questionary: {
      isCompleted: false,
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
  };
}

interface CreateFeedbackProps {
  onCreate?: (feedback: FeedbackCore) => void;
  onUpdate?: (feedback: FeedbackCore) => void;
  onSubmitted?: (feedback: FeedbackCore) => void;
  scheduledEventId: number;
}
function CreateFeedback({
  onCreate,
  onUpdate,
  onSubmitted,
  scheduledEventId,
}: CreateFeedbackProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankFeedback, setBlankFeedback] = useState<FeedbackWithQuestionary>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateGroupId: TemplateGroupId.FEEDBACK,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankFeedback = createFeedbackStub(
                  scheduledEventId,
                  activeTemplateId,
                  user.id,
                  result.blankQuestionarySteps
                );
                setBlankFeedback(blankFeedback);
              }
            });
        }
      });
  }, [setBlankFeedback, api, user, scheduledEventId]);

  if (!blankFeedback) {
    return <UOLoader />;
  }

  return (
    <FeedbackContainer
      feedback={blankFeedback}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateFeedback;
