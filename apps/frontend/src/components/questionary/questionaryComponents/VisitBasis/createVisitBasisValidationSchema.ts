import * as Yup from 'yup';

import { CreateYupValidation } from 'components/questionary/QuestionaryComponentRegistry';

export const createVisitBasisValidationSchema: CreateYupValidation = () => {
  const TODAY_MIDNIGT = new Date(new Date().setHours(0, 0, 0, 0));
  const schema = Yup.object().shape({
    proposalPk: Yup.number().min(1, 'Proposal is required'),

    startsAt: Yup.date()
      .typeError('Invalid date')
      .min(TODAY_MIDNIGT, 'Visit start date can not be in the past')
      .required('Visit start date is required'),

    endsAt: Yup.date()
      .required('Visit end date is required')
      .when('startsAt', {
        is: (startsAt: Date) => {
          return !!startsAt;
        },
        then: Yup.date()
          .min(Yup.ref('startsAt'), "End date can't be before Start date")
          .required('End Date/Time is required')
          .typeError('Invalid date'),
      })
      .typeError('Invalid date'),
  });

  return schema;
};
