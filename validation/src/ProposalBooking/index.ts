import * as Yup from 'yup';

export const activateBookingValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
});

// NOTE: The action is validated by graphql
export const finalizeBookingValidationSchema = Yup.object().shape({
  action: Yup.mixed().required(),
  id: Yup.number().required(),
});
