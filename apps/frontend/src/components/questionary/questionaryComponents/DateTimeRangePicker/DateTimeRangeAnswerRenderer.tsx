import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { Maybe, Scalars, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

const DateTimeRangeAnswerValueRenderer = ({
  value,
}: {
  value: Maybe<Scalars['IntStringDateBoolArray']['input']>;
}) => {
  const settingsFormatToUse = SettingsId.DATE_FORMAT;
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse,
  });
  if (value?.dateTimeRanges?.[0]?.from && value?.dateTimeRanges?.[0]?.to) {
    return (
      <span>
        {toFormattedDateTime(value.dateTimeRanges[0].from)} :{' '}
        {toFormattedDateTime(value.dateTimeRanges[0].to)}
      </span>
    );
  }

  return <span>Invalid date range</span>;
};

const DateAnswerRenderer: AnswerRenderer = ({ value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }

  return <DateTimeRangeAnswerValueRenderer value={value} />;
};

export default DateAnswerRenderer;
