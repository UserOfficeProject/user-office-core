import React from 'react';
import { Question } from '../../../../generated/sdk';
import TitledContainer from '../../../common/TitledContainer';

export function QuestionExcerpt({ question }: { question: Question }) {
  return (
    <TitledContainer label={'Question'}>{question.question}</TitledContainer>
  );
}
