import * as Yup from 'yup';

export const dateTimeRangeQuestionValidationSchema = (answer: any) => {
  const config = answer.config;
  let dateTimeRangeSchema = Yup.array()
    .of(
      Yup.object({
        from: Yup.date().required(),
        to: Yup.date().required(),
      })
    )
    .required();
  if (config.required) {
    dateTimeRangeSchema = dateTimeRangeSchema.min(1, 'A daterange is required');
  }

  const schema =  Yup.object({ dateTimeRanges: dateTimeRangeSchema });
  return schema;
};