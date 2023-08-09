import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { searchObjectByKey } from '../utils/helperFunctions';
import { markProposalEventAsDoneAndCallWorkflowEngine } from '../workflowEngine';

enum ProposalInformationKeys {
  Proposal = 'proposal',
  ProposalPk = 'proposalPk',
  ProposalPKs = 'proposalPks',
}

export const handleWorkflowEngineChange = async (
  proposalDataSource: ProposalDataSource,
  event: ApplicationEvent,
  proposalPk: number
) => {
  const proposal = await proposalDataSource.get(proposalPk);

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalPk} not found`);
  }

  const updatedProposals = await markProposalEventAsDoneAndCallWorkflowEngine(
    event.type,
    proposal
  );

  const eventBus = resolveApplicationEventBus();

  // NOTE: If proposal status is updated manually then we need to fire another event.
  // TODO: This could be refactored and we use only one event instead of two. Ref. changeProposalsStatus inside ProposalMutations.ts
  if (event.type === Event.PROPOSAL_STATUS_UPDATED) {
    eventBus.publish({
      type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
      proposal: proposal,
      isRejection: false,
      key: 'proposal',
      loggedInUserId: event.loggedInUserId,
    });
  } else if (updatedProposals) {
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
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

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
          Promise.all(
            (proposalInformationValue as number[]).map(async (proposalPk) => {
              if (proposalPk) {
                handleWorkflowEngineChange(
                  proposalDataSource,
                  event,
                  proposalPk
                );
              }
            })
          );
          break;
        case ProposalInformationKeys.ProposalPk:
          handleWorkflowEngineChange(
            proposalDataSource,
            event,
            proposalInformationValue
          );

          break;
        case ProposalInformationKeys.Proposal:
          handleWorkflowEngineChange(
            proposalDataSource,
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
