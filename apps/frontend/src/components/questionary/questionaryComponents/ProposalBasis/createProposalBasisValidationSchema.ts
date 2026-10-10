import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { getCurrentUser } from 'context/UserContextProvider';
import { UserRole, SettingsId } from 'generated/sdk';

export const createProposalBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  (_a, _b, _c, settingsMap) => {
    const MAX_TITLE_LEN = 175;
    let maxAbstractLength = 1500;
    if (settingsMap) {
      maxAbstractLength =
        parseInt(
          settingsMap.get(SettingsId.MAX_ABSTRACT_LEN)?.settingsValue || '1500',
          10
        ) || 1500;
    }

    const currentUser = getCurrentUser();
    const isUserOfficer =
      currentUser?.roles
        .map((role) => role.shortCode.toUpperCase())
        .includes(UserRole.USER_OFFICER.toUpperCase()) || false;

    const schema = Yup.object().shape({
      title: Yup.string()
        .trim()
        .max(
          MAX_TITLE_LEN,
          `Please make title at most ${MAX_TITLE_LEN} characters long`
        )
        .required('Proposal Title is required'),
      abstract: Yup.string()
        .trim()
        .max(
          maxAbstractLength,
          `Please make abstract at most ${maxAbstractLength} characters long`
        )
        .required('Proposal Abstract is required'),
      proposer: Yup.number().required('Please specify principal investigator'),
      users: Yup.array()
        .of(Yup.number())
        .when('proposer', {
          is: (proposerId: number) =>
            proposerId !== currentUser?.user.id && !isUserOfficer,
          then: (schema) =>
            schema
              .of(Yup.number())
              .test(
                'is-co-proposer',
                'You must be part of the proposal. Either add yourself as Principal Investigator or a Co-Proposer!',
                (value) =>
                  (currentUser?.user.id &&
                    value?.includes(currentUser.user.id)) ||
                  false
              ),
          otherwise: (schema) => schema.of(Yup.number()),
        }),
    });

    return schema;
  };
