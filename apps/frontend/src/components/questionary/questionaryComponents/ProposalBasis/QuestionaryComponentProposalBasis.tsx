import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { Field } from 'formik';
import React, { ChangeEvent, useContext, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import TextField from 'components/common/FormikUITextField';
import withPreventSubmit from 'components/common/withPreventSubmit';
import CoProposers from 'components/proposal/CoProposers';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import PrincipalInvestigator from 'components/proposal/PrincipalInvestigator';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { BasicUserDetails, Invite } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';

const TextFieldNoSubmit = withPreventSubmit(TextField);

function QuestionaryComponentProposalBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
    formikProps,
  } = props;
  const theme = useTheme();

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalContextType;

  const [localTitle, setLocalTitle] = useState(state?.proposal.title);
  const [localAbstract, setLocalAbstract] = useState(state?.proposal.abstract);
  const [hasInvalidChars, setHasInvalidChars] = useState(false);
  const [textLen, setTextLen] = useState(state?.proposal.abstract ?? 0);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposer, users } = state.proposal;

  const coProposersChanged = (users: BasicUserDetails[]) => {
    formikProps.setFieldValue(
      `${id}.users`,
      users.map((user) => user.id)
    );
    dispatch({
      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
      itemWithQuestionary: { users: users },
    });
  };

  const invitesChanged = (invites: Invite[]) => {
    formikProps.setFieldValue(`${id}.coProposerInvites`, { ...invites });
    dispatch({
      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
      itemWithQuestionary: { coProposerInvites: invites },
    });
  };

  const principalInvestigatorChanged = (user: BasicUserDetails) => {
    formikProps.setFieldValue(`${id}.proposer`, user.id);
    dispatch({
      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
      itemWithQuestionary: {
        proposer: user,
      },
    });

    // Remove the new PI from the co-proposers list (if present) and add the old PI (if present) to the co-proposers list
    coProposersChanged(
      users
        .filter((coInvestigator) => coInvestigator.id !== user.id)
        .concat(proposer as BasicUserDetails)
    );
  };
  const counter = `Characters: ${textLen}/1500`;

  return (
    <div>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        <Field
          name={`${id}.title`}
          label="Proposal Title"
          inputProps={{
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setLocalTitle(event.target.value),
            onBlur: () => {
              dispatch({
                type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                itemWithQuestionary: { title: localTitle },
              });
            },
          }}
          required
          fullWidth
          component={TextField}
          data-cy="title"
          margin="dense"
          id="title-input"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Field
          name={`${id}.abstract`}
          label="Proposal Abstract"
          inputProps={{
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              const nonPrintableRegex = /[^\x20-\x7E\n\r\t]/g;
              const hasInvalid = nonPrintableRegex.test(value);
              const cleanedValue = value.replace(nonPrintableRegex, ' ');
              setTextLen(event.target.value.length);
              setHasInvalidChars(hasInvalid);
              setLocalAbstract(cleanedValue);
            },
            onBlur: () => {
              dispatch({
                type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                itemWithQuestionary: { abstract: localAbstract },
              });
            },
          }}
          required
          multiline
          maxRows="16"
          minRows="4"
          fullWidth
          component={TextFieldNoSubmit}
          data-cy="abstract"
          margin="dense"
          id="abstract-input"
          InputLabelProps={{
            shrink: true,
          }}
          helperText={
            hasInvalidChars
              ? 'Non-printable characters have been removed from your input.'
              : 'Only printable ASCII characters are allowed.'
          }
        />
      </Box>
      <InputAdornment
        position="end"
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'right',
          marginBottom: -theme.spacing(50),
        })}
      >
        {counter}
      </InputAdornment>
      <PrincipalInvestigator
        setPrincipalInvestigator={principalInvestigatorChanged}
      />
      <CoProposers
        setPrincipalInvestigator={principalInvestigatorChanged}
        setUsers={coProposersChanged}
        setInvites={invitesChanged}
      />
      <ErrorMessage name={`${id}.users`} />
    </div>
  );
}

const proposalBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const proposal = (state as ProposalSubmissionState).proposal;
    const { primaryKey, title, abstract, users, proposer, callId } = proposal;

    let returnValue = state.questionary.questionaryId;

    if (primaryKey > 0) {
      const result = await api.updateProposal({
        proposalPk: primaryKey,
        title: title,
        abstract: abstract,
        users: users.map((user) => user.id),
        proposerId: proposer?.id,
      });

      const invites = await api.setCoProposerInvites({
        input: {
          proposalPk: result.updateProposal.primaryKey,
          emails: proposal.coProposerInvites.map((invite) => invite.email),
        },
      });

      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: {
          ...proposal,
          ...result.updateProposal,
          ...{ coProposerInvites: invites.setCoProposerInvites },
        },
      });
    } else {
      const { createProposal } = await api.createProposal({
        callId: callId,
      });
      const { updateProposal } = await api.updateProposal({
        proposalPk: createProposal.primaryKey,
        title: title,
        abstract: abstract,
        users: users.map((user) => user.id),
        proposerId: proposer?.id,
      });

      const invites = await api.setCoProposerInvites({
        input: {
          proposalPk: updateProposal.primaryKey,
          emails: proposal.coProposerInvites.map((invite) => invite.email),
        },
      });
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_CREATED',
        itemWithQuestionary: {
          ...proposal,
          ...createProposal,
          ...updateProposal,
          ...{ coProposerInvites: invites.setCoProposerInvites },
        },
      });
      returnValue = createProposal.questionaryId;
    }

    return returnValue;
  };

export { QuestionaryComponentProposalBasis, proposalBasisPreSubmit };
