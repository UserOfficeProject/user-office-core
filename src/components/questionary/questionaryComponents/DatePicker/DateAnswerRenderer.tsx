import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { toTzLessDateTime } from 'utils/Time';

const DateAnswerRenderer: AnswerRenderer = ({ value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }

  return <span>{toTzLessDateTime(value)}</span>;
};

export default DateAnswerRenderer;
