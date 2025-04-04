import React from 'react';

import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type ExperimentSafetyReviewSummaryProps = {
  confirm: WithConfirmType;
};

function ExperimentSafetyReviewSummary({
  confirm,
}: ExperimentSafetyReviewSummaryProps) {
  console.log({ confirm });

  return <>WIPsss</>;
}

export default withConfirm(ExperimentSafetyReviewSummary);
