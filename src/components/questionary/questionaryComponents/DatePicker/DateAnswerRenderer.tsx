import { DateTime } from 'luxon';
import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig } from 'generated/sdk';

const DateAnswerRenderer: AnswerRenderer = ({ config, value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }
  const format = (config as DateConfig).includeTime
    ? 'dd-MMM-yyyy HH:mm'
    : 'dd-MMM-yyyy';

  return <span>{DateTime.fromISO(value).toFormat(format)}</span>;
};

export default DateAnswerRenderer;
