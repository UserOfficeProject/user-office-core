import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  QuestionaryStep,
  TemplateGroupId,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { FeedbackWithQuestionary } from 'models/questionary/feedback/FeedbackWithQuestionary';

export function createFeedbackStub(
  experimentPk: number,
  templateId: number,
  creatorId: number,
  questionarySteps: QuestionaryStep[]
): FeedbackWithQuestionary {
  return {
    id: 0,
    experimentPk: experimentPk,
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

export function useBlankFeedback(experimentPk?: number | null) {
  const [blankFeedback, setBlankFeedback] =
    useState<FeedbackWithQuestionary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);
  const api = useDataApi();

  useEffect(() => {
    if (!experimentPk || !user.id) {
      if (!user.id) {
        setError('User not available');
      }
      if (!experimentPk) {
        setError('Experiment not available');
      }

      return;
    }

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
                const newBlankFeedback = createFeedbackStub(
                  experimentPk,
                  activeTemplateId,
                  user.id,
                  result.blankQuestionarySteps
                );
                setBlankFeedback(newBlankFeedback);
                setError(null);
              } else {
                setError('Could not create feedback stub');
              }
            });
        } else {
          setError('There is no active feedback template');
          api().addClientLog({
            error: 'There is no active feedback template',
          });
        }
      })
      .catch(() => {
        setError('Failed to fetch data for blank feedback');
      });
  }, [api, user, experimentPk]);

  return { blankFeedback, error };
}
