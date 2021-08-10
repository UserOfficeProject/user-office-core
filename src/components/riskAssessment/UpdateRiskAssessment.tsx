import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useRiskAssessment } from 'hooks/riskAssessment/useRiskAssessment';
import { RiskAssessmentCore } from 'models/RiskAssessmentSubmissionState';

import RiskAssessmentContainer from './RiskAssessmentContainer';

interface UpdateRiskAssessmentProps {
  riskAssessment: RiskAssessmentCore;
  onUpdate?: (riskAssessment: RiskAssessmentCore) => void;
  onSubmitted?: (riskAssessment: RiskAssessmentCore) => void;
}

function UpdateRiskAssessment({
  riskAssessment,
  onUpdate,
  onSubmitted,
}: UpdateRiskAssessmentProps) {
  const { riskAssessment: riskAssessmentData } = useRiskAssessment(
    riskAssessment.riskAssessmentId
  );

  if (!riskAssessmentData) {
    return <UOLoader />;
  }

  return (
    <RiskAssessmentContainer
      riskAssessment={riskAssessmentData}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default UpdateRiskAssessment;
