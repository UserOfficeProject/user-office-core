import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { getCurrentUser } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';

export const createProposalBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    const MAX_TITLE_LEN = 175;
    const MAX_ABSTRACT_LEN = 1500;
    const currentUser = getCurrentUser();
    const isUserOfficer =
      currentUser?.roles
        .map((role) => role.shortCode.toUpperCase())
        .includes(UserRole.USER_OFFICER.toUpperCase()) || false;

    const schema = Yup.object().shape({
      title: Yup.string()
        .max(
          MAX_TITLE_LEN,
          `Please make abstract at most ${MAX_TITLE_LEN} characters long`
        )
        .required('Title is required'),
      abstract: Yup.string()
        .max(
          MAX_ABSTRACT_LEN,
          `Please make abstract at most ${MAX_ABSTRACT_LEN} characters long`
        )
        .required('Abstract is required'),
      proposer: Yup.number().required('Please specify principal investigator'),
      users: Yup.array()
        .of(Yup.number())
        .when('proposer', {
          is: (proposerId: number) =>
            proposerId !== currentUser?.user.id && !isUserOfficer,
          then: Yup.array()
            .of(Yup.number())
            .test(
              'is-co-proposer',
              'You must be part of the proposal. Either add yourself as Principal Investigator or a Co-Proposer!',
              (value) =>
                (currentUser?.user.id &&
                  value?.includes(currentUser.user.id)) ||
                false
            ),
          otherwise: Yup.array().of(Yup.number()),
        }),
    });

    return schema;
  };
