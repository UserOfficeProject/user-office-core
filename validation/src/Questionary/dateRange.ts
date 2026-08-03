import * as Yup from 'yup';

export const dateRangeQuestionValidationSchema = (answer: any) => {
  const config = answer.config;
  let dateRangeSchema = Yup.array()
    .of(
      Yup.object({
        from: Yup.date().required(),
        to: Yup.date().required(),
      })
    )
    .required();
  if (config.required) {
    dateRangeSchema = dateRangeSchema.min(1, 'A daterange is required');
  }

  const schema =  Yup.object({ dateRanges: dateRangeSchema });
  return schema;
};