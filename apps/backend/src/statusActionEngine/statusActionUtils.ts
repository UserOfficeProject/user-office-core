import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { InstrumentWithManagementTime } from '../models/Instrument';
import { BasicUserDetails, User } from '../models/User';
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
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  pi?: BasicUserDetails | null;
  coProposers?: BasicUserDetails[] | null;
  instruments?: InstrumentWithManagementTime[];
};

/**
 * Populates an array of EmailReadyType[] objects containing all user and proposal data needed to send one or more emails.
 * The PI and CoProposers are always included as commonly used data, regardless of the recipient.
 *
 * @param emailReadyUsersWithProposals - An empty array of email ready users with their associated proposals.
 * @param recipientUsers - The list of users to send the email to (e.g. a single PI or multiple FAP Reviewers).
 * @param proposal - The proposal associated with the event.
 * @param recipientsWithEmailTemplate - The recipient category (e.g. FAP Reviewers) with the associated email template.
 */
export const getEmailReadyArrayOfUsersAndProposals = async (
  emailReadyUsersWithProposals: EmailReadyType[],
  recipientUsers: BasicUserDetails[] | User[],
  proposal: WorkflowEngineProposalType,
  recipientsWithEmailTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  await Promise.all(
    recipientUsers.map(async (recipient) => {
      const foundIndex = emailReadyUsersWithProposals.findIndex(
        (emailReadyUserWithProposals) =>
          emailReadyUserWithProposals.email === recipient.email
      );

      if (foundIndex !== -1 && recipientsWithEmailTemplate?.combineEmails) {
        emailReadyUsersWithProposals[foundIndex].proposals.push(proposal);
      } else {
        // Always make the PI and CoProposers available in templates
        const pi = proposal
          ? await usersDataSource.getBasicUserInfo(proposal.proposerId)
          : null;
        const coProposers = proposal
          ? await usersDataSource.getProposalUsers(proposal.primaryKey)
          : null;

        emailReadyUsersWithProposals.push({
          id: recipientsWithEmailTemplate.recipient.name,
          proposals: [proposal],
          template: recipientsWithEmailTemplate.emailTemplate.id,
          email: recipient.email,
          firstName: recipient.firstname,
          lastName: recipient.lastname,
          preferredName: recipient.preferredname,
          pi: pi,
          coProposers: coProposers,
        });
      }
    })
  );
};

export const getPIAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const PIs: EmailReadyType[] = [];
  for (const proposal of proposals) {
    const PI = await usersDataSource.getBasicUserInfo(proposal.proposerId);

    if (PI) {
      await getEmailReadyArrayOfUsersAndProposals(
        PIs,
        [PI],
        proposal,
        recipientWithTemplate
      );
    }
  }

  return PIs;
};

export const getCoProposersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const CoPs: EmailReadyType[] = [];
  for (const proposal of proposals) {
    const coProposers = await usersDataSource.getProposalUsers(
      proposal.primaryKey
    );

    await getEmailReadyArrayOfUsersAndProposals(
      CoPs,
      coProposers,
      proposal,
      recipientWithTemplate
    );
  }

  return CoPs;
};

export const getFapReviewersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const fapDataSource: FapDataSource = container.resolve(Tokens.FapDataSource);

  const FRs: EmailReadyType[] = [];
  for (const proposal of proposals) {
    const allFapReviewers =
      await fapDataSource.getFapUsersByProposalPkAndCallId(
        proposal.primaryKey,
        proposal.callId
      );

    await getEmailReadyArrayOfUsersAndProposals(
      FRs,
      allFapReviewers,
      proposal,
      recipientWithTemplate
    );
  }

  return FRs;
};

export const getFapChairSecretariesAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const fapDataSource: FapDataSource = container.resolve(Tokens.FapDataSource);
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const FCSs: EmailReadyType[] = [];
  for (const proposal of proposals) {
    const fap = await fapDataSource.getFapByProposalPk(proposal.primaryKey);

    const fapChair = fap?.fapChairUserIds ? fap?.fapChairUserIds : [];

    const fapChairAndSecsIds = fap?.fapSecretariesUserIds
      ? fap.fapSecretariesUserIds.concat(fapChair)
      : fapChair;

    const fapChairAndSecs =
      await usersDataSource.getUsersByUserNumbers(fapChairAndSecsIds);

    await getEmailReadyArrayOfUsersAndProposals(
      FCSs,
      fapChairAndSecs,
      proposal,
      recipientWithTemplate
    );
  }

  return FCSs;
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
  for (const proposal of proposals) {
    const proposalInstruments =
      await instrumentDataSource.getInstrumentsByProposalPk(
        proposal.primaryKey
      );

    if (!proposalInstruments?.length) {
      return ISs;
    }

    const instrumentsPeople = await Promise.all(
      proposalInstruments.map(async (proposalInstrument) => {
        const instrumentContact = await usersDataSource.getBasicUserInfo(
          proposalInstrument.managerUserId
        );

        if (!instrumentContact) {
          return;
        }

        const instrumentScientists =
          await instrumentDataSource.getInstrumentScientists(
            proposalInstrument.id
          );

        return [instrumentContact, ...instrumentScientists];
      })
    );

    const filteredInstrumentPeople = instrumentsPeople
      .flat()
      .filter(
        (user, i, array): user is BasicUserDetails =>
          !!user && array.findIndex((v2) => v2?.id === user?.id) === i
      );

    await getEmailReadyArrayOfUsersAndProposals(
      ISs,
      filteredInstrumentPeople,
      proposal,
      recipientWithTemplate
    );
  }

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
