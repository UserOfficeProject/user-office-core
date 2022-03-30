import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

const DateAnswerRenderer: AnswerRenderer = ({ config, value }) => {
  const settingsFormatToUse = (config as DateConfig).includeTime
    ? SettingsId.DATE_TIME_FORMAT
    : SettingsId.DATE_FORMAT;
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse,
  });

  if (!value) {
    return <span>Left blank</span>;
  }

  return <span>{toFormattedDateTime(value)}</span>;
};

export default DateAnswerRenderer;
