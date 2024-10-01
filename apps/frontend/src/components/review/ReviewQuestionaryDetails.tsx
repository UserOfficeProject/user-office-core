import React from 'react';

import QuestionaryDetails, {
  QuestionaryDetailsProps,
} from 'components/questionary/QuestionaryDetails';

interface ReviewQuestionaryDetailsProps extends QuestionaryDetailsProps {
  id: number;
}

function ReviewQuestionaryDetails(props: ReviewQuestionaryDetailsProps) {
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

export default ReviewQuestionaryDetails;
