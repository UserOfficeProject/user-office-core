import * as Yup from 'yup';

export const createInviteValidationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  note: Yup.string().optional(),
  claims: Yup.object().shape({
    roleIds: Yup.array().of(Yup.number()).optional(),
    coProposerProposalPk: Yup.number().optional(),
  }),
});

export const updateInviteValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  code: Yup.string().optional(),
  email: Yup.string().email().optional(),
  note: Yup.string().optional(),
  claims: Yup.object().shape({
    roleIds: Yup.array().of(Yup.number()).optional(),
    coProposerProposalPk: Yup.number().optional(),
  }),
});
