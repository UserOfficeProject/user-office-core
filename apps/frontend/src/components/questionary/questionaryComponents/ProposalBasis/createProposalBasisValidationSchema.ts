import {
  DEFAULT_PROPOSAL_ABSTRACT_MAX_LENGTH,
  DEFAULT_PROPOSAL_TITLE_MAX_LENGTH,
  PROPOSAL_TITLE_DB_MAX_LENGTH,
} from '@user-office-software/duo-validation';
import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { getCurrentUser } from 'context/UserContextProvider';
import { ProposalBasisConfig, UserRole } from 'generated/sdk';

export const createProposalBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  (answer) => {
    const config = answer.config as ProposalBasisConfig;
    const MAX_TITLE_LEN = Math.min(
      config.maxTitleLength ?? DEFAULT_PROPOSAL_TITLE_MAX_LENGTH,
      PROPOSAL_TITLE_DB_MAX_LENGTH
    );
    const MAX_ABSTRACT_LEN =
      config.maxAbstractLength ?? DEFAULT_PROPOSAL_ABSTRACT_MAX_LENGTH;
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
          MAX_ABSTRACT_LEN,
          `Please make abstract at most ${MAX_ABSTRACT_LEN} characters long`
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
