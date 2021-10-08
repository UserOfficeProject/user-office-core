import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const NumberInputAnswerRenderer: AnswerRenderer = (answer) => {
  if (!answer.value.value) {
    return <span>Left blank</span>;
  }

  const value = answer.value.value;
  const unit = answer.value.unit;

  return (
    <span>
      {value}
      {unit ? ` ${unit}` : ''}
    </span>
  );
};

export default NumberInputAnswerRenderer;
