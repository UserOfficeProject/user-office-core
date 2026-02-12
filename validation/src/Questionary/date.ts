import { DateTime } from 'luxon';
import * as Yup from 'yup';

function normalizeDate(date: string, includeTime: boolean) {
  let normalizedDate = DateTime.fromISO(date);

  if (includeTime) {
    normalizedDate = normalizedDate.startOf('minute');
  } else {
    normalizedDate = normalizedDate.startOf('day');
  }

  return normalizedDate.toJSDate();
}

export const dateQuestionValidationSchema = (field: any) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  let schema;
  const config = field.config;

  if (config.includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  if (config.required) {
    schema = Yup.date()
      .required('This field is required')
      .transform(function (value: Date) {
        return value && this.isType(value)
          ? normalizeDate(value.toISOString(), config.includeTime)
          : value;
      })
      .typeError(config.includeTime ? 'Invalid datetime' : 'Invalid date');
  } else {
    schema = Yup.date()
      .typeError(config.includeTime ? 'Invalid datetime' : 'Invalid date')
      .nullable();
  }

  if (config.minDate) {
    const minDate = normalizeDate(config.minDate, config.includeTime);

    schema = schema.min(
      minDate,
      `Date must be no earlier than ${new Date(minDate).toLocaleDateString(
        'en-GB',
        options
      )}`
    );
  }

  if (config.maxDate) {
    const maxDate = normalizeDate(config.maxDate, config.includeTime);
    schema = schema.max(
      maxDate,
      `Date must be no latter than ${new Date(maxDate).toLocaleDateString(
        'en-GB',
        options
      )}`
    );
  }

  return schema;
};
