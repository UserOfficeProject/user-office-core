import makeStyles from '@material-ui/core/styles/makeStyles';
import { ErrorMessage, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { ChangeEvent, useContext, useState } from 'react';

import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import ProposalParticipant from 'components/proposal/ProposalParticipant';
import ProposalParticipants from 'components/proposal/ProposalParticipants';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { Answer, BasicUserDetails } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import { EventType } from 'models/QuestionarySubmissionState';

const TextFieldNoSubmit = withPreventSubmit(TextField);

const useStyles = makeStyles(theme => ({
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
  container: {
    margin: theme.spacing(1, 0),
  },
  error: {
    color: theme.palette.error.main,
    marginRight: '10px',
  },
}));

function QuestionaryComponentProposalBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { proposalQuestionId },
    },
    formikProps,
  } = props;

  const classes = useStyles();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalContextType;

  const [localTitle, setLocalTitle] = useState(state?.proposal.title);
  const [localAbstract, setLocalAbstract] = useState(state?.proposal.abstract);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposer, users } = state.proposal;

  return (
    <div>
      <div className={classes.container}>
        <Field
          name={`${proposalQuestionId}.title`}
          label="Title"
          inputProps={{
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setLocalTitle(event.target.value),
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
          margin="dense"
        />
      </div>
      <div className={classes.container}>
        <Field
          name={`${proposalQuestionId}.abstract`}
          label="Abstract"
          inputProps={{
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setLocalAbstract(event.target.value),
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
          component={TextFieldNoSubmit}
          data-cy="abstract"
          margin="dense"
        />
      </div>
      <ProposalParticipant
        userChanged={(user: BasicUserDetails) => {
          formikProps.setFieldValue(`${proposalQuestionId}.proposer`, user.id);
          dispatch({
            type: EventType.PROPOSAL_MODIFIED,
            payload: { proposal: { ...state.proposal, proposer: user } },
          });
        }}
        className={classes.container}
        userId={proposer?.id}
      />
      <ProposalParticipants
        className={classes.container}
        setUsers={(users: BasicUserDetails[]) => {
          formikProps.setFieldValue(
            `${proposalQuestionId}.users`,
            users.map(user => user.id)
          );
          dispatch({
            type: EventType.PROPOSAL_MODIFIED,
            payload: { proposal: { ...state.proposal, users: users } },
          });
        }}
        // quickfix for material table changing immutable state
        // https://github.com/mbrn/material-table/issues/666
        users={JSON.parse(JSON.stringify(users))}
      />
      <ErrorMessage
        name={`${proposalQuestionId}.users`}
        className={classes.error}
        component="span"
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

  let returnValue = state.questionaryId;

  if (id > 0) {
    const result = await api.updateProposal({
      id: id,
      title: title,
      abstract: abstract,
      users: users.map(user => user.id),
      proposerId: proposer?.id,
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
        proposerId: proposer?.id,
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
      returnValue = createResult.createProposal.proposal.questionaryId;
    }
  }

  return returnValue;
};

export { QuestionaryComponentProposalBasis, proposalBasisPreSubmit };
