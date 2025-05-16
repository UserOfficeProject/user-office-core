import React from 'react';

import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ExperimentSafetyReviewWithQuestionary } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewWithQuestionary';

export interface ExperimentSafetyReviewQuestionaryReviewProps {
  experimentSafety: ExperimentSafetyReviewWithQuestionary;
}

export default function ExperimentSafetyReviewQuestionaryReview({
  experimentSafety,
}: ExperimentSafetyReviewQuestionaryReviewProps) {
  if (!experimentSafety.safetyReviewQuestionaryId) {
    throw new Error('Experiment safety review questionary not found');
  }

  return (
    <QuestionaryDetails
      questionaryId={experimentSafety.safetyReviewQuestionaryId}
      questionaryData={experimentSafety.safetyReviewQuestionary}
    />
  );
}
