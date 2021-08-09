import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  QuestionaryStep,
  RiskAssessmentStatus,
  TemplateCategoryId,
} from 'generated/sdk';
import { RiskAssessmentWithQuestionary } from 'models/RiskAssessmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RiskAssessmentContainer from './RiskAssessmentContainer';

function createRiskAssessmentStub(
  proposalPk: number,
  templateId: number,
  questionarySteps: QuestionaryStep[]
): RiskAssessmentWithQuestionary {
  return {
    riskAssessmentId: 0,
    proposalPk: proposalPk,
    status: RiskAssessmentStatus.DRAFT,
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
}
function CreateRiskAssessment({
  onCreate,
  onUpdate,
  onSubmitted,
  proposalPk,
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
                  activeTemplateId,
                  result.blankQuestionarySteps
                );
                setBlankRiskAssessment(blankRiskAssessment);
              }
            });
        }
      });
  }, [setBlankRiskAssessment, api, user, proposalPk]);

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
