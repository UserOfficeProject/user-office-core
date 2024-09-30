import Button from '@mui/material/Button';
import React, { useContext, useEffect, useState } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { isCallEnded } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ProposalContextType } from './ProposalContainer';
import { ProposalStatusDefaultShortCodes } from './ProposalsSharedConstants';

type ProposalSummaryProps = {
  confirm: WithConfirmType;
};

function ProposalReview({ confirm }: ProposalSummaryProps) {
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalContextType;

  if (!dispatch || !state) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { isInternalUser } = useContext(UserContext);
  const callHasEnded = isCallEnded(
    state.proposal.call?.startCall,
    state.proposal.call?.endCall
  );
  const isCallActiveInternal = state.proposal?.call?.isActiveInternal ?? true;
  const [loadingSubmitMessage, setLoadingSubmitMessage] =
    useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonMessage, setSubmitButtonMessage] = useState<string>(
    'I am aware that no further edits can be made after proposal submission.'
  );

  const proposal = state.proposal;

  const downloadPDFProposal = useDownloadPDFProposal();

  const allStepsComplete =
    proposal.questionary &&
    proposal.questionary.steps.every((step) => step.isCompleted);

  const [submitDisabled, setSubmitDisabled] = useState(() => {
    const submissionDisabled =
      (!isUserOfficer && callHasEnded) || // disallow submit for non user officers if the call ended
      !allStepsComplete ||
      proposal.submitted;

    if (
      !proposal.submitted &&
      submissionDisabled &&
      isInternalUser &&
      isCallActiveInternal &&
      allStepsComplete
    ) {
      return false; // allow submit for intenal users if the call ended
    }

    return submissionDisabled;
  });

  const [
    proposalSubmissionSuccessMessage,
    setProposalSubmissionSuccessMessage,
  ] = useState<string>(
    'Your proposal has been submitted successfully. You will receive a confirmation email soon.'
  );

  // Show a different submit confirmation if
  // EDITABLE_SUBMITTED is an upcoming status
  useEffect(() => {
    async function initializeSubmissionMessage() {
      if (!proposal.callId || submitDisabled) {
        setLoadingSubmitMessage(false);

        return;
      }
      const { call } = await api().getCall({ callId: proposal.callId });
      const workflowId = call?.proposalWorkflowId;
      if (workflowId) {
        const connections = (
          await api().getProposalWorkflow({ proposalWorkflowId: workflowId })
        ).proposalWorkflow?.proposalWorkflowConnectionGroups;

        if (connections) {
          const statuses = (await api().getProposalStatuses()).proposalStatuses;
          const editableStatuses = statuses
            ?.filter(
              //needs to be provided
              (s) =>
                s.shortCode ===
                  ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED ||
                s.shortCode ===
                  ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL
            )
            .map((status) => status.id);
          const hasUpcomingEditableStatus =
            connections &&
            connections.some((group) =>
              group.connections.find(
                (conn) =>
                  conn.nextProposalStatusId &&
                  editableStatuses?.includes(conn.nextProposalStatusId)
              )
            );

          if (proposal.status != null && hasUpcomingEditableStatus) {
            setSubmitButtonMessage(
              'Submit proposal? The proposal can be edited after submission.'
            );
          } else {
            setSubmitButtonMessage(
              'I am aware that no further edits can be made after proposal submission.'
            );
          }
        }
      }

      if (call?.submissionMessage) {
        setProposalSubmissionSuccessMessage(call.submissionMessage);
      }

      setLoadingSubmitMessage(false);
    }
    initializeSubmissionMessage();
  }, [api, proposal.callId, proposal.status, submitDisabled]);

  if (loadingSubmitMessage) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      <ProposalQuestionaryReview data={proposal} />
      <NavigationFragment
        disabled={proposal.status?.id === 0}
        isLoading={isSubmitting}
      >
        <NavigButton
          onClick={() => dispatch({ type: 'BACK_CLICKED' })}
          disabled={state.stepIndex === 0}
          isBusy={isSubmitting}
        >
          Back
        </NavigButton>
        <NavigButton
          onClick={() => {
            confirm(
              async () => {
                setIsSubmitting(true);
                try {
                  const { submitProposal } = await api({
                    toastSuccessMessage: proposalSubmissionSuccessMessage,
                  }).submitProposal({
                    proposalPk: state.proposal.primaryKey,
                  });

                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                    itemWithQuestionary: submitProposal,
                  });
                  dispatch({
                    type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                    itemWithQuestionary: submitProposal,
                  });
                } finally {
                  setSubmitDisabled(true);
                  setIsSubmitting(false);
                }
              },
              {
                title: 'Please confirm',
                description: submitButtonMessage,
              }
            )();
          }}
          disabled={submitDisabled}
          isBusy={isSubmitting}
          data-cy="button-submit-proposal"
        >
          {proposal.submitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
        <Button
          onClick={() =>
            downloadPDFProposal([proposal.primaryKey], proposal.title)
          }
          disabled={!allStepsComplete || isSubmitting}
          color="secondary"
        >
          Download PDF
        </Button>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ProposalReview);
