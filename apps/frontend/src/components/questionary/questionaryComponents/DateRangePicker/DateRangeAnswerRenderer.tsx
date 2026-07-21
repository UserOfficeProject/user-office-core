import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { Maybe, Scalars, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

// NOTE: This is additional component because of some react warning with hooks when we use the useFormattedDateTime inside default DateAnswerRenderer component.
const DateRangeAnswerValueRenderer = ({
  value,
}: {
  value: Maybe<Scalars['IntStringDateBoolArray']['input']>;
}) => {
  const settingsFormatToUse = SettingsId.DATE_FORMAT;
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse,
  });
  if (value?.dateRanges?.[0]?.from && value?.dateRanges?.[0]?.to) {
    return (
      <span>
        {toFormattedDateTime(value.dateRanges[0].from)} :{' '}
        {toFormattedDateTime(value.dateRanges[0].to)}
      </span>
    );
  }

  return <span>Invalid date range</span>;
};

const DateAnswerRenderer: AnswerRenderer = ({ value }) => {
  if (!value) {
    return <span>Left blank</span>;
  }

  return <DateRangeAnswerValueRenderer value={value} />;
};

export default DateAnswerRenderer;
