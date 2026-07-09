import { DateTime } from 'luxon';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DateRangeConfig } from 'generated/sdk';

export const preSubmitDateTransform: QuestionaryComponentDefinition['preSubmitTransform'] =
  (answer) => {
    const ifNotRequiredDateCanBeNull =
      !(answer.config as DateRangeConfig).required && answer.value === null;

    return {
      ...answer,
      value: ifNotRequiredDateCanBeNull
        ? null
        : DateTime.fromISO(answer.value, { zone: 'utc' }).toISO(), // ISO time format with utc timezone
    };
  };
