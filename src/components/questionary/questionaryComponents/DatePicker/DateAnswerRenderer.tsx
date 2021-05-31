import dateFormat from 'dateformat';
import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig } from 'generated/sdk';

const DateAnswerRenderer: AnswerRenderer = ({ config, value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }
  const format = (config as DateConfig).includeTime
    ? 'dd-mmm-yyyy HH:MM'
    : 'dd-mmm-yyyy';

  return <span>{dateFormat(value, format)}</span>;
};

export default DateAnswerRenderer;
