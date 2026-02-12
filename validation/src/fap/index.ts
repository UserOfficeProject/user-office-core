import * as Yup from 'yup';

export const createFapValidationSchema = Yup.object().shape({
  code: Yup.string().required(),
  description: Yup.string().required(),
  numberRatingsRequired: Yup.number().min(2).required(),
});

export const updateFapValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  code: Yup.string().required(),
  description: Yup.string().required(),
  numberRatingsRequired: Yup.number().min(2).required(),
});

export const assignFapChairOrSecretaryValidationSchema = (UserRole: any) =>
  Yup.object().shape({
    assignChairOrSecretaryToFapInput: Yup.object()
      .shape({
        userId: Yup.number().required(),
        roleId: Yup.number()
          .oneOf([UserRole.FAP_CHAIR, UserRole.FAP_SECRETARY])
          .required(),
        fapId: Yup.number().required(),
      })
      .required(),
  });

export const assignFapMembersValidationSchema = Yup.object().shape({
  memberIds: Yup.array(Yup.number()).required(),
  fapId: Yup.number().required(),
});

export const removeFapMemberValidationSchema = Yup.object().shape({
  memberId: Yup.number().required(),
  fapId: Yup.number().required(),
});

export const assignProposalToFapValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  fapId: Yup.number().required(),
});

export const assignFapMemberToProposalValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  fapId: Yup.number().required(),
  memberId: Yup.number().required(),
});

export const updateTimeAllocationValidationSchema = Yup.object({
  fapId: Yup.number().required(),
  proposalPk: Yup.number().required(),
  fapTimeAllocation: Yup.number()
    .min(0, ({ min }) => `Must be greater than or equal to ${min}`)
    .max(1e5, ({ max }) => `Must be less than or equal to ${max}`)
    .nullable(),
});

export const saveFapMeetingDecisionValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required(),
  commentForUser: Yup.string().nullable(),
  commentForManagement: Yup.string().nullable(),
  recommendation: Yup.string().nullable(),
  rankOrder: Yup.number()
    .min(0, ({ min }) => `Must be greater than or equal to ${min}`)
    .max(1e5, ({ max }) => `Must be less than or equal to ${max}`),
  submitted: Yup.bool().nullable(),
});

export const overwriteFapMeetingDecisionRankingValidationSchema =
  Yup.object().shape({
    proposalPk: Yup.number().required(),
    rankOrder: Yup.number()
      .min(0, ({ min }) => `Must be greater than or equal to ${min}`)
      .max(1e5, ({ max }) => `Must be less than or equal to ${max}`),
  });
