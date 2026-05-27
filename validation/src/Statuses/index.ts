import * as Yup from 'yup';

export const createStatusValidationSchema = Yup.object()
  .shape({
    id: Yup.string()
      .max(50)
      .trim()
      .test(
        'noWhiteSpaces',
        'Should not contain white spaces',
        (value) => !/\s/.test(value as string)
      )
      .uppercase()
      .required(),
    name: Yup.string().max(100).required(),
    description: Yup.string().max(200).required(),
    entityType: Yup.string().oneOf(['PROPOSAL', 'EXPERIMENT']).required(),
  })
  .strict(true);

export const updateStatusValidationSchema = Yup.object()
  .shape({
    id: Yup.string()
      .max(50)
      .trim()
      .test(
        'noWhiteSpaces',
        'Should not contain white spaces',
        (value) => !/\s/.test(value as string)
      )
      .uppercase()
      .required(),
    name: Yup.string().max(100).required(),
    description: Yup.string().max(200).required(),
    isDefault: Yup.bool(),
  })
  .strict(true);

export const deleteStatusValidationSchema = Yup.object().shape({
  id: Yup.string().required(),
});
