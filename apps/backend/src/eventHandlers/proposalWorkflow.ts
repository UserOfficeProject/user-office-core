import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { searchObjectByKey } from '../utils/helperFunctions';
import {
  WorkflowEngineProposalType,
  markProposalsEventAsDoneAndCallWorkflowEngine,
} from '../workflowEngine';

enum ProposalInformationKeys {
  Proposal = 'proposal',
  ProposalPk = 'proposalPk',
  ProposalPKs = 'proposalPks',
}

const publishProposalStatusChange = async (
  updatedProposals: (void | WorkflowEngineProposalType)[]
) => {
  if (!updatedProposals) {
    return;
  }
  const eventBus = resolveApplicationEventBus();
  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );
  updatedProposals.map(async (updatedProposal) => {
    if (updatedProposal) {
      const proposalStatus = await proposalSettingsDataSource.getProposalStatus(
        updatedProposal.statusId
      );
      const previousProposalStatus =
        await proposalSettingsDataSource.getProposalStatus(
          updatedProposal.prevProposalStatusId
        );

      return eventBus.publish({
        type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
        proposal: updatedProposal,
        isRejection: false,
        key: 'proposal',
        loggedInUserId: null,
        description: `From "${previousProposalStatus?.name}" to "${proposalStatus?.name}"`,
      });
    }
  });
};

const handleSubmittedProposalsAfterCallEnded = async (
  updatedProposals: (void | WorkflowEngineProposalType)[]
) => {
  if (!updatedProposals) {
    return;
  }
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const notEndedInternalCalls = await callDataSource
    .getCalls({
      isEnded: true,
      isEndedInternal: false,
    })
    .then((calls) => calls.map((call) => call.id));

  const proposalPks = updatedProposals
    .filter(
      (proposal) => proposal && notEndedInternalCalls.includes(proposal.callId)
    )
    .map((proposal) => proposal && proposal.primaryKey) as number[];

  if (proposalPks.length <= 0) {
    return;
  }

  const updatedSubmittedProposals =
    await markProposalsEventAsDoneAndCallWorkflowEngine(
      Event.CALL_ENDED,
      proposalPks
    );
  if (updatedSubmittedProposals) {
    await publishProposalStatusChange(updatedSubmittedProposals);
  }
};

export const handleWorkflowEngineChange = async (
  event: ApplicationEvent,
  proposalPks: number[] | number
) => {
  const isArray = Array.isArray(proposalPks);

  const updatedProposals = await markProposalsEventAsDoneAndCallWorkflowEngine(
    event.type,
    isArray ? proposalPks : [proposalPks]
  );

  if (
    event.type !== Event.PROPOSAL_STATUS_CHANGED_BY_USER &&
    updatedProposals?.length
  ) {
    await publishProposalStatusChange(updatedProposals);
    if (event.type === Event.PROPOSAL_SUBMITTED) {
      await handleSubmittedProposalsAfterCallEnded(updatedProposals);
    }
  }
};

const extractProposalInformationFromEvent = (event: ApplicationEvent) => {
  let proposalInformationObject, proposalInformationKey;
  const proposalKeysToLookFor = Object.values(ProposalInformationKeys);

  // NOTE: Go through the event object and try to find some of the ProposalInformationKeys.
  for (const key of proposalKeysToLookFor) {
    proposalInformationObject = searchObjectByKey(event, key);

    if (
      proposalInformationObject &&
      proposalInformationObject[key as keyof object]
    ) {
      proposalInformationKey = key;

      break;
    }
  }

  return { proposalInformationObject, proposalInformationKey };
};

export default function createHandler() {
  // Handler to align input for workflowEngine
  return async function proposalWorkflowHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of moving forward in the workflow
    if (event.isRejection) {
      return;
    }

    const { proposalInformationObject, proposalInformationKey } =
      extractProposalInformationFromEvent(event);

    // If none of the ProposalInformationKeys found then it is not a proposal event
    if (!proposalInformationObject || !proposalInformationKey) {
      return;
    }

    const proposalInformationValue =
      proposalInformationObject?.[proposalInformationKey as keyof object];

    if (proposalInformationValue) {
      switch (proposalInformationKey) {
        case ProposalInformationKeys.ProposalPKs:
        case ProposalInformationKeys.ProposalPk:
          handleWorkflowEngineChange(event, proposalInformationValue);

          break;
        case ProposalInformationKeys.Proposal:
          handleWorkflowEngineChange(
            event,
            (proposalInformationValue as Proposal).primaryKey
          );

          break;
        default:
          break;
      }
    }
  };
}
