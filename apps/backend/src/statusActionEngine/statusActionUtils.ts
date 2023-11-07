import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { BasicUserDetails } from '../models/User';
import {
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../resolvers/types/ProposalStatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';

interface GroupedObjectType {
  [key: string]: WorkflowEngineProposalType[];
}

export const groupProposalsByProperties = (
  proposals: WorkflowEngineProposalType[],
  props: string[]
) => {
  const getProposalGroups = (item: WorkflowEngineProposalType) => {
    const groupItemsArray = [];
    for (let i = 0; i < props.length; i++) {
      groupItemsArray.push(item[props[i] as keyof WorkflowEngineProposalType]);
    }

    return groupItemsArray;
  };

  const proposalGroups: GroupedObjectType = {};

  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    const proposalGroup = JSON.stringify(getProposalGroups(proposal));
    proposalGroups[proposalGroup] = proposalGroups[proposalGroup] || [];
    proposalGroups[proposalGroup].push(proposal);
  }

  return Object.keys(proposalGroups).map((group) => {
    return proposalGroups[group];
  });
};

export type EmailReadyType = {
  id: EmailStatusActionRecipients;
  proposals: WorkflowEngineProposalType[];
  template: string;
  email: string;
};

export const getEmailReadyArrayOfUsersAndProposals = (
  emailReadyUsersWithProposals: EmailReadyType[],
  users: BasicUserDetails[],
  proposal: WorkflowEngineProposalType,
  recipientsWithEmailTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  users.forEach((user) => {
    const foundIndex = emailReadyUsersWithProposals.findIndex(
      (emailReadyUserWithProposals) =>
        emailReadyUserWithProposals.email === user.email
    );

    if (foundIndex !== -1) {
      emailReadyUsersWithProposals[foundIndex].proposals.push(proposal);
    } else {
      emailReadyUsersWithProposals.push({
        id: recipientsWithEmailTemplate.recipient.name,
        proposals: [proposal],

        template: recipientsWithEmailTemplate.emailTemplate.id,
        email: user.email,
      });
    }
  });
};

export const getPIAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const PIs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const PI = await usersDataSource.getBasicUserInfo(proposal.proposerId);

      if (!PI) {
        return;
      }

      getEmailReadyArrayOfUsersAndProposals(
        PIs,
        [PI],
        proposal,
        recipientWithTemplate
      );
    })
  );

  return PIs;
};

export const getCoProposersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const PIs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const coProposers = await usersDataSource.getProposalUsers(
        proposal.primaryKey
      );

      getEmailReadyArrayOfUsersAndProposals(
        PIs,
        coProposers,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return PIs;
};

export const getSEPReviewersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const sepDataSource: SEPDataSource = container.resolve(Tokens.SEPDataSource);

  const SRs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const allSepReviewers =
        await sepDataSource.getSEPUsersByProposalPkAndCallId(
          proposal.primaryKey,
          proposal.callId
        );

      getEmailReadyArrayOfUsersAndProposals(
        SRs,
        allSepReviewers,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return SRs;
};

export const getInstrumentScientistsAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const ISs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const proposalInstrument =
        await instrumentDataSource.getInstrumentByProposalPk(
          proposal.primaryKey
        );

      if (!proposalInstrument) {
        return;
      }

      const beamLineManager = await usersDataSource.getBasicUserInfo(
        proposalInstrument.managerUserId
      );

      if (!beamLineManager) {
        return;
      }

      const instrumentScientists =
        await instrumentDataSource.getInstrumentScientists(
          proposalInstrument.id
        );

      const instrumentScientistsWithManager = [
        beamLineManager,
        ...instrumentScientists,
      ];

      getEmailReadyArrayOfUsersAndProposals(
        ISs,
        instrumentScientistsWithManager,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return ISs;
};

export const publishMessageToTheEventBus = async (
  proposals: WorkflowEngineProposalType[],
  messageDescription: string,
  exchange?: string
) => {
  const eventBus = resolveApplicationEventBus();

  await Promise.all(
    proposals.map(async (proposal) => {
      const event = {
        type: Event.PROPOSAL_STATUS_ACTION_EXECUTED,
        proposal: proposal,
        key: 'proposal',
        loggedInUserId: null,
        isRejection: false,
        description: messageDescription,
        exchange: exchange,
      } as ApplicationEvent;

      return eventBus
        .publish(event)
        .catch((e) =>
          logger.logError(`EventBus publish failed ${event.type}`, e)
        );
    })
  );
};
