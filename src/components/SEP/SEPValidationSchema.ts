import * as yup from 'yup';

export const SEPValidationSchema = yup.object().shape({
  code: yup.string().required('Code can not be blank'),
  description: yup.string().required('Description can not be blank'),
  numberRatingsRequired: yup
    .number()
    .min(2, 'Ratings required can not be lower than 2'),
});

export const AssignProposalToSEPValidationSchema = yup.object().shape({
  selectedSEPId: yup.string().required('You must select active SEP'),
});

export const AssignSEPMemberToProposalValidationSchema = yup.object().shape({
  selectedMemberId: yup.string().required('You must select SEP member'),
});
