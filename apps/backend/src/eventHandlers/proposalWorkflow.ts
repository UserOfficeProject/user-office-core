import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { searchObjectByKey } from '../utils/helperFunctions';
import { markProposalsEventAsDoneAndCallWorkflowEngine } from '../workflowEngine';

enum ProposalInformationKeys {
  Proposal = 'proposal',
  ProposalPk = 'proposalPk',
  ProposalPKs = 'proposalPks',
}

export const handleWorkflowEngineChange = async (
  event: ApplicationEvent,
  proposalPks: number[] | number
) => {
  const isArray = Array.isArray(proposalPks);

  const updatedProposals = await markProposalsEventAsDoneAndCallWorkflowEngine(
    event.type,
    isArray ? proposalPks : [proposalPks]
  );

  const eventBus = resolveApplicationEventBus();

  if (
    event.type !== Event.PROPOSAL_STATUS_CHANGED_BY_USER &&
    updatedProposals?.length
  ) {
    updatedProposals.forEach(
      (updatedProposal) =>
        updatedProposal &&
        eventBus.publish({
          type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
          proposal: updatedProposal,
          isRejection: false,
          key: 'proposal',
          loggedInUserId: event.loggedInUserId,
        })
    );
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
