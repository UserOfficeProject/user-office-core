import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Field } from 'formik';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import TextField from 'components/common/FormikUITextField';
import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import ProposalParticipant from 'components/proposal/ProposalParticipant';
import Participants from 'components/proposal/ProposalParticipants';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { BasicUserDetails, Invite } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { useBasicUserData } from 'hooks/user/useUserData';
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

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposer, users, coProposerInvites } = state.proposal;
  const { loading, userData } = useBasicUserData(state?.proposal.proposer?.id);
  const [piData, setPIData] = useState<BasicUserDetails | null>(null);

  useEffect(() => {
    if (userData !== null) {
      setPIData(userData);
    }
  }, [userData]);

  const coInvestigatorChanged = (users: BasicUserDetails[]) => {
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
    setPIData(user);
    coInvestigatorChanged(
      users
        .filter((coInvestigator) => coInvestigator.id !== user.id)
        .concat(proposer as BasicUserDetails)
    );
  };

  return (
    <div>
      <Box sx={{ margin: theme.spacing(2, 0) }}>
        <Field
          name={`${id}.title`}
          label="Title"
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
          label="Abstract"
          inputProps={{
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setLocalAbstract(event.target.value),
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
        />
      </Box>
      <ProposalParticipant
        principalInvestigator={piData}
        setPrincipalInvestigator={principalInvestigatorChanged}
        sx={{ margin: theme.spacing(2, 0) }}
        loadingPrincipalInvestigator={loading}
      />
      <Participants
        title="Co-Proposers"
        sx={{ margin: theme.spacing(2, 0) }}
        principalInvestigator={piData}
        setPrincipalInvestigator={principalInvestigatorChanged}
        setUsers={coInvestigatorChanged}
        preserveSelf={true}
        // QuickFix for material table changing immutable state
        // https://github.com/mbrn/material-table/issues/666
        users={JSON.parse(JSON.stringify(users))}
        invites={coProposerInvites}
        setInvites={invitesChanged}
        loadingPrincipalInvestigator={loading}
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

      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: {
          ...proposal,
          ...result.updateProposal,
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
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_CREATED',
        itemWithQuestionary: {
          ...proposal,
          ...createProposal,
          ...updateProposal,
        },
      });
      returnValue = createProposal.questionaryId;
    }

    return returnValue;
  };

export { QuestionaryComponentProposalBasis, proposalBasisPreSubmit };
