import * as Yup from 'yup';

export const createPredefinedMessageValidationSchema = Yup.object().shape({
  title: Yup.string().required(),
  message: Yup.string().required(),
  key: Yup.string().required(),
});

export const updatePredefinedMessageValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  title: Yup.string().required(),
  message: Yup.string().required(),
  key: Yup.string().required(),
});
