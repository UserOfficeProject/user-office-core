import * as Yup from 'yup';
import { normalizeDate } from './date';

export const dateRangeQuestionValidationSchema = (field: any) => {
  const schema = Yup.array().of(
    Yup.object({
      from: Yup.date().required().transform(function (value: Date) {
        return value && this.isType(value)
          ? normalizeDate(value.toISOString(), false)
          : value;
      })
      .typeError('Invalid date'),
      to: Yup.date().required().transform(function (value: Date) {
        return value && this.isType(value)
          ? normalizeDate(value.toISOString(), false)
          : value;
      })
      .typeError('Invalid date')
    })
  );

  return schema;
};