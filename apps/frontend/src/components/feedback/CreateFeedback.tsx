import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  QuestionaryStep,
  TemplateGroupId,
} from 'generated/sdk';
import { FeedbackWithQuestionary } from 'models/questionary/feedback/FeedbackWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import FeedbackContainer from './FeedbackContainer';

function createFeedbackStub(
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

interface CreateFeedbackProps {
  experimentPk: number;
}
function CreateFeedback({ experimentPk }: CreateFeedbackProps) {
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
                  experimentPk,
                  activeTemplateId,
                  user.id,
                  result.blankQuestionarySteps
                );
                setBlankFeedback(blankFeedback);
              }
            });
        }
      });
  }, [setBlankFeedback, api, user, experimentPk]);

  if (!blankFeedback) {
    return <UOLoader />;
  }

  return <FeedbackContainer feedback={blankFeedback} />;
}

export default CreateFeedback;
