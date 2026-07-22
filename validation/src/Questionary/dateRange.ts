import * as Yup from 'yup';
import { normalizeDate } from './date';

export const dateRangeQuestionValidationSchema = (answer: any) => {
  const schema =   Yup.object({
    dateRanges: Yup.array()
      .of(
        Yup.object({
          from: Yup.date().required(),
          to: Yup.date().required(),
        })
      )
      .required(),
  });

  return schema;
};