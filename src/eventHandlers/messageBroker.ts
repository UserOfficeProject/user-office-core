import { logger } from '@esss-swap/duo-logger';
import { Queue, RabbitMQMessageBroker } from '@esss-swap/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventHandler } from '../events/eventBus';
import { ProposalEndStatus } from '../models/Proposal';
import { ProposalStatusDefaultShortCodes } from '../models/ProposalStatus';

type ProposalAcceptedMessage = {
  proposalId: number;
  shortCode: string;
  title: string;
  abstract: string;
  members: { firstName: string; lastName: string; email: string }[];
  proposer?: { firstName: string; lastName: string; email: string };
};

export function createPostToQueueHandler() {
  // return the mapped implementation
  return container.resolve<EventHandler<ApplicationEvent>>(
    Tokens.PostToMessageQueue
  );
}

export function createPostToRabbitMQHandler() {
  const proposalSettingsDataSource = container.resolve<ProposalSettingsDataSource>(
    Tokens.ProposalSettingsDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  const rabbitMQ = new RabbitMQMessageBroker();

  rabbitMQ.setup({
    hostname: process.env.RABBITMQ_HOSTNAME,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
  });

  return async (event: ApplicationEvent) => {
    // if the original method failed
    // there is no point of publishing any event
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW:
      case Event.PROPOSAL_STATUS_CHANGED_BY_USER:
        const proposal = event.proposal;
        const proposalStatus = await proposalSettingsDataSource.getProposalStatus(
          proposal.statusId
        );

        // if the new status isn't 'SCHEDULING' ignore the event
        if (
          proposalStatus?.shortCode !==
          ProposalStatusDefaultShortCodes.SCHEDULING
        ) {
          logger.logDebug(
            `Proposal '${proposal.id}' status isn't 'SCHEDULING', skipping`,
            { proposal, proposalStatus }
          );

          return;
        }

        const instrument = await instrumentDataSource.getInstrumentByProposalId(
          proposal.id
        );

        if (!instrument) {
          logger.logWarn(`Proposal '${proposal.id}' has no instrument`, {
            proposal,
          });

          return;
        }

        // NOTE: maybe use shared types?
        const message = {
          proposalId: proposal.id,
          callId: proposal.callId,
          // the UI supports days
          allocatedTime: proposal.managementTimeAllocation * 24 * 60 * 60,
          instrumentId: instrument.id,
        };

        const json = JSON.stringify(message);

        await rabbitMQ.sendMessage(Queue.PROPOSAL, event.type, json);

        logger.logDebug(
          'Proposal event successfully sent to the message broker',
          { eventType: event.type, json }
        );

        break;

      case Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED:
        switch (event.proposal.finalStatus) {
          case ProposalEndStatus.ACCEPTED:
            const proposal = event.proposal;

            const proposalUsers = await userDataSource.getProposalUsersFull(
              proposal.id
            );

            const message: ProposalAcceptedMessage = {
              proposalId: proposal.id,
              shortCode: proposal.shortCode,
              title: proposal.title,
              abstract: proposal.abstract,
              members: proposalUsers.map((proposalUser) => ({
                firstName: proposalUser.firstname,
                lastName: proposalUser.lastname,
                email: proposalUser.email,
              })),
            };

            const proposer = await userDataSource.getUser(proposal.proposerId);

            if (proposer) {
              message.proposer = {
                firstName: proposer.firstname,
                lastName: proposer.lastname,
                email: proposer.email,
              };
            }

            const json = JSON.stringify(message);

            await rabbitMQ.sendMessage(
              Queue.PROPOSAL,
              Event.PROPOSAL_ACCEPTED,
              json
            );
            break;
          default:
            break;
        }

        break;
    }
  };
}

export function createSkipPostingHandler() {
  return async (event: ApplicationEvent) => {
    // no op
  };
}
