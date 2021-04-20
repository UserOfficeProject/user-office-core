import React from 'react';

import SamplesAnswerRenderer from 'components/questionary/questionaryComponents/SampleDeclaration/SamplesAnswerRenderer';
import QuestionaryDetails, {
  QuestionaryDetailsProps,
} from 'components/questionary/QuestionaryDetails';
import { DataType } from 'generated/sdk';

interface ProposalQuestionaryDetailsProps extends QuestionaryDetailsProps {
  proposalId: number;
}

function ProposalQuestionaryDetails(props: ProposalQuestionaryDetailsProps) {
  return (
    <QuestionaryDetails
      answerRenderer={(answer) => {
        if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
          return (
            <SamplesAnswerRenderer
              proposalId={props.proposalId}
              answer={answer}
            />
          );
        } else {
          return null;
        }
      }}
      {...props}
    />
  );
}

export default ProposalQuestionaryDetails;
