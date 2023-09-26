import React from 'react';

import GenericTemplatesAnswerRenderer from 'components/questionary/questionaryComponents/GenericTemplate/GenericTemplateAnswerRenderer';
import SamplesAnswerRenderer from 'components/questionary/questionaryComponents/SampleDeclaration/SamplesAnswerRenderer';
import QuestionaryDetails, {
  QuestionaryDetailsProps,
} from 'components/questionary/QuestionaryDetails';
import { DataType } from 'generated/sdk';

interface ProposalQuestionaryDetailsProps extends QuestionaryDetailsProps {
  proposalPk: number;
}

function ProposalQuestionaryDetails(props: ProposalQuestionaryDetailsProps) {
  const { proposalPk, questionaryId, additionalDetails } = props;

  return (
    <QuestionaryDetails
      questionaryId={questionaryId}
      additionalDetails={additionalDetails}
      answerRenderer={(answer) => {
        if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
          return (
            <SamplesAnswerRenderer proposalPk={proposalPk} answer={answer} />
          );
        } else if (answer.question.dataType === DataType.GENERIC_TEMPLATE) {
          return (
            <GenericTemplatesAnswerRenderer
              proposalPk={proposalPk}
              answer={answer}
            />
          );
        } else {
          return null;
        }
      }}
    />
  );
}

export default ProposalQuestionaryDetails;
