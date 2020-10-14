import { Grid, makeStyles } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContext } from 'components/proposal/ProposalContainer';
import ProposalParticipant from 'components/proposal/ProposalParticipant';
import ProposalParticipants from 'components/proposal/ProposalParticipants';
import { BasicUserDetails, Sdk } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';

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
  const MAX_TITLE_LEN = 175;
  const MAX_ABSTRACT_LEN = 1500;

  const { errors, touched } = props;

  const classes = useStyles();
  const proposalContext = useContext(ProposalContext);

  const [localTitle, setLocalTitle] = useState(
    proposalContext.state?.proposal.title
  );
  const [localAbstract, setLocalAbstract] = useState(
    proposalContext.state?.proposal.abstract
  );

  useEffect(() => {
    setLocalTitle(proposalContext.state?.proposal.title);
    setLocalAbstract(proposalContext.state?.proposal.abstract);
  }, [proposalContext.state]);

  if (!proposalContext) {
    return null;
  }

  const { dispatch, state } = proposalContext;
  const { proposer, users } = state!.proposal;

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextFieldWithCounter
            required
            id="title"
            name="title"
            label="Title"
            value={localTitle}
            fullWidth
            onBlur={event => {
              dispatch({
                type: EventType.PROPOSAL_UPDATED,
                payload: { proposal: { title: event.target.value } },
              });
            }}
            onChange={event => setLocalTitle(event.target.value)}
            error={touched.title && errors.title !== undefined}
            helperText={touched.title && errors.title && errors.title}
            data-cy="title"
            maxLen={MAX_TITLE_LEN}
          />
        </Grid>
        <Grid item xs={12}>
          <TextFieldWithCounter
            required
            id="abstract"
            name="abstract"
            label="Abstract"
            multiline
            rowsMax="16"
            rows="4"
            value={localAbstract}
            onChange={event => setLocalAbstract(event.target.value)}
            fullWidth
            onBlur={event => {
              dispatch({
                type: EventType.PROPOSAL_UPDATED,
                payload: { proposal: { abstract: event.target.value } },
              });
            }}
            error={touched.abstract && errors.abstract !== undefined}
            helperText={touched.abstract && errors.abstract && errors.abstract}
            data-cy="abstract"
            maxLen={MAX_ABSTRACT_LEN}
          />
        </Grid>
      </Grid>
      <ProposalParticipant
        userChanged={(user: BasicUserDetails) => {
          dispatch({
            type: EventType.PROPOSAL_UPDATED,
            payload: { proposal: { proposer: user } },
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
            type: EventType.PROPOSAL_UPDATED,
            payload: { proposal: { users: users } },
          });
        }}
        // quickfix for material table changing immutable state
        // https://github.com/mbrn/material-table/issues/666
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}

async function proposalBasisPreSubmit(
  state: QuestionarySubmissionState,
  dispatch: React.Dispatch<Event>,
  api: Sdk
) {
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
          proposal: result.updateProposal.proposal,
        },
      });
    }
  } else {
    const result = await api.createProposal({
      callId: callId,
    });

    if (result.createProposal.proposal) {
      dispatch({
        type: EventType.PROPOSAL_CREATED,
        payload: {
          proposal: result.createProposal.proposal,
        },
      });
    }
  }
}

export { QuestionaryComponentProposalBasis, proposalBasisPreSubmit };
