import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { ChangeEvent, KeyboardEvent, useContext, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContext } from 'components/proposal/ProposalContainer';
import ProposalParticipant from 'components/proposal/ProposalParticipant';
import ProposalParticipants from 'components/proposal/ProposalParticipants';
import { Answer, BasicUserDetails } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import { EventType } from 'models/QuestionarySubmissionState';

const useStyles = makeStyles({
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
  pi: {
    marginTop: '30px',
    marginBottom: '30px',
  },
});

function QuestionaryComponentProposalBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { proposalQuestionId },
    },
  } = props;

  const classes = useStyles();
  const proposalContext = useContext(ProposalContext);

  const [localTitle, setLocalTitle] = useState(
    proposalContext.state?.proposal.title
  );
  const [localAbstract, setLocalAbstract] = useState(
    proposalContext.state?.proposal.abstract
  );

  if (!proposalContext?.state) {
    return null;
  }

  const { dispatch, state } = proposalContext;
  const { proposer, users } = state.proposal;

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field
            name={`${proposalQuestionId}.title`}
            label="Title"
            inputProps={{
              onChange: (event: ChangeEvent<HTMLInputElement>) =>
                setLocalTitle(event.target.value),
              onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();

                  return false;
                }
              },
              onBlur: () => {
                dispatch({
                  type: EventType.PROPOSAL_MODIFIED,
                  payload: {
                    proposal: { ...state.proposal, title: localTitle },
                  },
                });
              },
            }}
            required
            fullWidth
            component={TextField}
            data-cy="title"
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name={`${proposalQuestionId}.abstract`}
            label="Abstract"
            inputProps={{
              onChange: (event: ChangeEvent<HTMLInputElement>) =>
                setLocalAbstract(event.target.value),
              onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();

                  return false;
                }
              },
              onBlur: () => {
                dispatch({
                  type: EventType.PROPOSAL_MODIFIED,
                  payload: {
                    proposal: { ...state.proposal, abstract: localAbstract },
                  },
                });
              },
            }}
            required
            multiline
            rowsMax="16"
            rows="4"
            fullWidth
            component={TextField}
            data-cy="abstract"
          />
        </Grid>
      </Grid>
      <ProposalParticipant
        userChanged={(user: BasicUserDetails) => {
          dispatch({
            type: EventType.PROPOSAL_MODIFIED,
            payload: { proposal: { ...state.proposal, proposer: user } },
          });
        }}
        title="Principal investigator"
        className={classes.pi}
        userId={proposer.id}
      />
      <ProposalParticipants
        error={false} // FIXME
        setUsers={(users: BasicUserDetails[]) => {
          dispatch({
            type: EventType.PROPOSAL_MODIFIED,
            payload: { proposal: { ...state.proposal, users: users } },
          });
        }}
        // quickfix for material table changing immutable state
        // https://github.com/mbrn/material-table/issues/666
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}

const proposalBasisPreSubmit = (answer: Answer) => async ({
  api,
  dispatch,
  state,
}: SubmitActionDependencyContainer) => {
  const proposal = (state as ProposalSubmissionState).proposal;
  const { id, title, abstract, users, proposer, callId } = proposal;

  if (id > 0) {
    const result = await api.updateProposal({
      id: id,
      title: title,
      abstract: abstract,
      users: users.map(user => user.id),
      proposerId: proposer.id,
    });

    if (result.updateProposal.proposal) {
      dispatch({
        type: EventType.PROPOSAL_LOADED,
        payload: {
          proposal: { ...proposal, ...result.updateProposal.proposal },
        },
      });
    }
  } else {
    const createResult = await api.createProposal({
      callId: callId,
    });

    if (createResult.createProposal.proposal) {
      const updateResult = await api.updateProposal({
        id: createResult.createProposal.proposal.id,
        title: title,
        abstract: abstract,
        users: users.map(user => user.id),
        proposerId: proposer.id,
      });
      dispatch({
        type: EventType.PROPOSAL_CREATED,
        payload: {
          proposal: {
            ...proposal,
            ...createResult.createProposal.proposal,
            ...updateResult.updateProposal.proposal,
          },
        },
      });
    }
  }
};

export { QuestionaryComponentProposalBasis, proposalBasisPreSubmit };
