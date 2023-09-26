import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { Unit } from 'generated/sdk';

export const IntervalAnswerRenderer: AnswerRenderer = (answer) => {
  const isMinAnswered = typeof answer.value.min === 'number';
  const isMaxAnswered = typeof answer.value.max === 'number';

  const isAnswered = isMinAnswered || isMaxAnswered; // at least one answer

  if (isAnswered === false) {
    return <span>Left blank</span>;
  }

  const min = answer.value.min ?? 'unspecified';
  const max = answer.value.max ?? 'unspecified';
  const symbol = (answer.value.unit as Unit)?.symbol || '';

  return (
    <span>
      {min} &ndash; {max} {symbol ?? ''}
    </span>
  );
};
