import * as Yup from 'yup';

export const createProposalValidationSchema = Yup.object().shape({
  callId: Yup.number().required(),
});

export const updateProposalValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  title: Yup.string().required(),
  abstract: Yup.string().required(),
  answers: Yup.array().notRequired(),
  topicsCompleted: Yup.array().notRequired(),
  users: Yup.array().notRequired(),
  proposerId: Yup.number().notRequired(),
  partialSave: Yup.bool().notRequired(),
});

export const submitProposalValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
});

export const deleteProposalValidationSchema = submitProposalValidationSchema;
export const proposalNotifyValidationSchema = submitProposalValidationSchema;

export const administrationProposalValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  finalStatus: Yup.string().nullable(),
  commentForUser: Yup.string().nullable(),
  commentForManagement: Yup.string().nullable(),
  managementTimeAllocations: Yup.array()
    .of(
      Yup.object().shape({
        instrumentId: Yup.number().required(),
        value: Yup.number()
          .min(0, ({ min }) => `Must be greater than or equal to ${min}`)
          .max(1e5, ({ max }) => `Must be less than or equal to ${max}`)
          .nullable(),
      })
    )
    .nullable()
    .min(1),
  managementDecisionSubmitted: Yup.bool().nullable(),
});

export const createProposalScientistCommentValidationSchema =
  Yup.object().shape({
    comment: Yup.string().min(1).required('Comment is required'),
    proposalPk: Yup.number().required(),
  });

export const updateProposalScientistCommentValidationSchema =
  Yup.object().shape({
    commentId: Yup.number().required(),
    comment: Yup.string().min(1).required('Comment is required'),
  });

export const deleteProposalScientistCommentValidationSchema =
  Yup.object().shape({
    commentId: Yup.number().required(),
  });
