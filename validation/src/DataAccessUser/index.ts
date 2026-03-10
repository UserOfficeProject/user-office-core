import * as Yup from 'yup';

export const updateDataAccessUsersValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  userIds: Yup.array().of(Yup.number().required()).required(),
});
