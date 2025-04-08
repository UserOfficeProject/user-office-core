import React from 'react';

import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { ExperimentSafetyReviewWithQuestionary } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewWithQuestionary';

export interface ExperimentSafetyReviewQuestionaryReviewProps {
  experimentSafety: ExperimentSafetyReviewWithQuestionary;
}

export default function ExperimentSafetyReviewQuestionaryReview({
  experimentSafety,
}: ExperimentSafetyReviewQuestionaryReviewProps) {
  const additionalDetails: TableRowData[] = [
    {
      label: 'Sample1',
      value: 'Sample1',
    },
    {
      label: 'Sample2',
      value: 'Sample2',
    },
  ];

  if (!experimentSafety.safetyReviewQuestionaryId) {
    throw new Error('Experiment safety review questionary not found');
  }

  return (
    <QuestionaryDetails
      questionaryId={experimentSafety.safetyReviewQuestionaryId}
      questionaryData={experimentSafety.safetyReviewQuestionary}
      additionalDetails={additionalDetails}
    />
  );
}
