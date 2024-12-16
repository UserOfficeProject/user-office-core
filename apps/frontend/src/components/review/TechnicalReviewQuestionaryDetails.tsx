import React from 'react';

import QuestionaryDetails, {
  QuestionaryDetailsProps,
} from 'components/questionary/QuestionaryDetails';

interface TechnicalReviewQuestionaryDetailsProps
  extends QuestionaryDetailsProps {
  id: number;
}

function TechnicalReviewQuestionaryDetails(
  props: TechnicalReviewQuestionaryDetailsProps
) {
  const { questionaryId, questionaryData, additionalDetails } = props;

  return (
    <QuestionaryDetails
      questionaryId={questionaryId}
      questionaryData={questionaryData}
      additionalDetails={additionalDetails}
      answerRenderer={() => {
        return null;
      }}
    />
  );
}

export default TechnicalReviewQuestionaryDetails;
