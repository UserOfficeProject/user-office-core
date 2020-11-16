import React from 'react';

import TitledContainer from 'components/common/TitledContainer';
import { Question } from 'generated/sdk';

export function QuestionExcerpt({ question }: { question: Question }) {
  return (
    <TitledContainer label={'Question'}>{question.question}</TitledContainer>
  );
}
