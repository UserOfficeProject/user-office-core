import { useContext } from 'react';

import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { RiskAssessmentContextType } from 'components/riskAssessment/RiskAssessmentContainer';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { RiskAssessmentSubmissionState } from 'models/RiskAssessmentSubmissionState';

function QuestionaryComponentRiskAssessmentBasis() {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as RiskAssessmentContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return null;
}

const riskAssessmentBasisPreSubmit = () => async ({
  api,
  dispatch,
  state,
}: SubmitActionDependencyContainer) => {
  const riskAssessment = (state as RiskAssessmentSubmissionState)
    .riskAssessment;

  let returnValue = state.questionary.questionaryId;
  if (riskAssessment.questionary.questionaryId) {
    // Already has questionary
    return riskAssessment.questionary.questionaryId;
  }

  // create new questionary
  const result = await api.createRiskAssessment({
    proposalPk: riskAssessment.proposalPk,
  });
  const newRiskAssessment = result.createRiskAssessment.riskAssessment;

  if (newRiskAssessment) {
    dispatch({
      type: 'RISK_ASSESSMENT_CREATED',
      riskAssessment: newRiskAssessment,
    });
    returnValue = newRiskAssessment.questionary.questionaryId;
  }

  return returnValue;
};

export {
  QuestionaryComponentRiskAssessmentBasis,
  riskAssessmentBasisPreSubmit,
};
