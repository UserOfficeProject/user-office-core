import React from 'react';

import SamplesAnswerRenderer from 'components/questionary/questionaryComponents/SampleDeclaration/SamplesAnswerRenderer';
import QuestionaryDetails, {
  QuestionaryDetailsProps,
} from 'components/questionary/QuestionaryDetails';
import { DataType } from 'generated/sdk';

interface ProposalQuestionaryDetailsProps extends QuestionaryDetailsProps {
  proposalPk: number;
}

function ProposalQuestionaryDetails(props: ProposalQuestionaryDetailsProps) {
  const { proposalPk, ...restProps } = props;

  return (
    <QuestionaryDetails
      answerRenderer={(answer) => {
        if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
          return (
            <SamplesAnswerRenderer proposalPk={proposalPk} answer={answer} />
          );
        } else {
          return null;
        }
      }}
      {...restProps}
    />
  );
}

export default ProposalQuestionaryDetails;
