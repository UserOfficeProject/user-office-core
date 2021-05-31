import { makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import Participants from 'components/proposal/ProposalParticipants';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { VisitationContextType } from 'components/visitation/VisitationContainer';
import { BasicUserDetails } from 'generated/sdk';
import { useUserProposals } from 'hooks/proposal/useUserProposals';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { EventType } from 'models/QuestionarySubmissionState';
import { VisitationSubmissionState } from 'models/VisitationSubmissionState';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1, 0),
  },
}));

function QuestionaryComponentVisitationBasis(props: BasicComponentProps) {
  const { answer, formikProps } = props;
  const classes = useStyles();

  const { proposals, loadingProposals } = useUserProposals();

  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as VisitationContextType;

  const questionId = answer.question.id;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <FormikDropdown
        name={`${questionId}.proposalId`}
        label="Select proposal"
        loading={loadingProposals}
        noOptionsText="No proposals"
        items={proposals.map((proposal) => ({
          text: proposal.title,
          value: proposal.id,
        }))}
        InputProps={{ 'data-cy': 'proposal-selection' }}
        onChange={(event) => {
          dispatch({
            type: EventType.VISITATION_MODIFIED,
            payload: {
              visitation: {
                ...state.visitation,
                proposalId: event.target.value,
              },
            },
          });
        }}
        required
      />

      <Participants
        title="Add More Visitors"
        className={classes.container}
        setUsers={(team: BasicUserDetails[]) => {
          formikProps.setFieldValue(
            `${questionId}.team`,
            team.map((user) => user.id)
          );
          dispatch({
            type: EventType.VISITATION_MODIFIED,
            payload: { visitation: { ...state.visitation, team } },
          });
        }}
        users={JSON.parse(JSON.stringify(state.visitation.team))}
      />
    </>
  );
}

const visitationBasisPreSubmit = () => async ({
  api,
  dispatch,
  state,
}: SubmitActionDependencyContainer) => {
  const visitation = (state as VisitationSubmissionState).visitation;
  const { proposalId, team } = visitation;
  let returnValue = state.questionaryId;
  if (visitation.id > 0) {
    const result = await api.updateVisitation({
      visitationId: visitation.id,
      proposalId: visitation.proposalId,
      team: visitation.team.map((user) => user.id),
    });

    if (result.updateVisitation.visitation) {
      dispatch({
        type: EventType.VISITATION_MODIFIED,
        payload: {
          visitation: { ...visitation, ...result.updateVisitation.visitation },
        },
      });
    }
  } else {
    const result = await api.createVisitation({
      proposalId: proposalId,
      team: team.map((user) => user.id),
    });

    const newVisitation = result.createVisitation.visitation;
    if (newVisitation) {
      dispatch({
        type: EventType.VISITATION_CREATED,
        payload: {
          visitation: newVisitation,
        },
      });
      returnValue = newVisitation.questionaryId;
    }
  }

  return returnValue;
};

export { QuestionaryComponentVisitationBasis, visitationBasisPreSubmit };
