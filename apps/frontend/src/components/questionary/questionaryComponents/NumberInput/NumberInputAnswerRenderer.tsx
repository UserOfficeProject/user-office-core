import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { Unit } from 'generated/sdk';

const NumberInputAnswerRenderer: AnswerRenderer = (answer) => {
  if (!answer.value.value) {
    return <span>Left blank</span>;
  }

  const value = answer.value.value;
  const symbol = (answer.value.unit as Unit)?.symbol;

  return (
    <span>
      {value} {symbol ?? ''}
    </span>
  );
};

export default NumberInputAnswerRenderer;
