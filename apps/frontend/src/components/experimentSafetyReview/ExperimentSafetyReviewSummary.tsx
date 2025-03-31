import React from 'react';

import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ExperimentSafetyReviewSummaryProps = {
  confirm: WithConfirmType;
};

function ExperimentSafetyReviewSummary({
  confirm,
}: ExperimentSafetyReviewSummaryProps) {
  return <>WIP</>;
}

export default withConfirm(ExperimentSafetyReviewSummary);
