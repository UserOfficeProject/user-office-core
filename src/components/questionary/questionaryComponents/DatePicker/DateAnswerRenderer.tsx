import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import {
  DateConfig,
  FieldConfig,
  Maybe,
  Scalars,
  SettingsId,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

// NOTE: This is additional component because of some react warning with hooks when we use the useFormattedDateTime inside default DateAnswerRenderer component.
const DateAnswerValueRenderer: React.FC<{
  config: FieldConfig;
  value: Maybe<Scalars['IntStringDateBoolArray']>;
}> = ({ config, value }) => {
  const settingsFormatToUse = (config as DateConfig).includeTime
    ? SettingsId.DATE_TIME_FORMAT
    : SettingsId.DATE_FORMAT;
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse,
  });

  return <span>{toFormattedDateTime(value)}</span>;
};

const DateAnswerRenderer: AnswerRenderer = ({ config, value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }

  return <DateAnswerValueRenderer config={config} value={value} />;
};

export default DateAnswerRenderer;
