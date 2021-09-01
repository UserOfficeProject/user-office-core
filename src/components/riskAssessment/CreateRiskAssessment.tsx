import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  QuestionaryStep,
  RiskAssessmentStatus,
  TemplateCategoryId,
} from 'generated/sdk';
import { RiskAssessmentWithQuestionary } from 'models/questionary/riskAssessment/RiskAssessmentWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RiskAssessmentContainer from './RiskAssessmentContainer';

function createRiskAssessmentStub(
  proposalPk: number,
  scheduledEventId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[]
): RiskAssessmentWithQuestionary {
  return {
    riskAssessmentId: 0,
    proposalPk: proposalPk,
    scheduledEventId: scheduledEventId,
    status: RiskAssessmentStatus.DRAFT,
    samples: [],
    questionary: {
      isCompleted: false,
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
  };
}

interface CreateRiskAssessmentProps {
  onCreate?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
  onUpdate?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
  onSubmitted?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
  proposalPk: number;
  scheduledEventId: number;
}
function CreateRiskAssessment({
  onCreate,
  onUpdate,
  onSubmitted,
  proposalPk,
  scheduledEventId,
}: CreateRiskAssessmentProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [
    blankRiskAssessment,
    setBlankRiskAssessment,
  ] = useState<RiskAssessmentWithQuestionary>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateCategoryId: TemplateCategoryId.RISK_ASSESSMENT,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankRiskAssessment = createRiskAssessmentStub(
                  proposalPk,
                  scheduledEventId,
                  activeTemplateId,
                  result.blankQuestionarySteps
                );
                setBlankRiskAssessment(blankRiskAssessment);
              }
            });
        }
      });
  }, [setBlankRiskAssessment, api, user, proposalPk, scheduledEventId]);

  if (!blankRiskAssessment) {
    return <UOLoader />;
  }

  return (
    <RiskAssessmentContainer
      riskAssessment={blankRiskAssessment}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateRiskAssessment;
