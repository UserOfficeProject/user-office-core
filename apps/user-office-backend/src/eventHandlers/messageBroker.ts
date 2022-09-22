import { logger } from '@user-office-software/duo-logger';
import {
  Queue,
  RabbitMQMessageBroker,
} from '@user-office-software/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventHandler } from '../events/eventBus';
import { AllocationTimeUnits } from '../models/Call';
import { Proposal, ProposalEndStatus } from '../models/Proposal';
import { ScheduledEventCore } from '../models/ScheduledEventCore';

type ProposalMessageData = {
  proposalPk: number;
  shortCode: string;
  title: string;
  abstract: string;
  newStatus?: string;
  members: { firstName: string; lastName: string; email: string; id: string }[];
  proposer?: { firstName: string; lastName: string; email: string; id: string };
};

let rabbitMQCachedBroker: null | RabbitMQMessageBroker = null;

const getRabbitMQMessageBroker = () => {
  if (rabbitMQCachedBroker === null) {
    rabbitMQCachedBroker = createRabbitMQMessageBroker();
  }

  return rabbitMQCachedBroker;
};

const createRabbitMQMessageBroker = () => {
  const messageBroker = new RabbitMQMessageBroker();
  messageBroker.setup({
    hostname: process.env.RABBITMQ_HOSTNAME,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VIRTUAL_HOST ?? '/',
  });

  return messageBroker;
};

export function createPostToQueueHandler() {
  // return the mapped implementation
  return container.resolve<EventHandler<ApplicationEvent>>(
    Tokens.PostToMessageQueue
  );
}

export function createListenToQueueHandler() {
  // return the mapped implementation
  return container.resolve<EventHandler<ApplicationEvent>>(
    Tokens.ListenToMessageQueue
  );
}

const getProposalMessageData = async (proposal: Proposal) => {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );
  const proposalStatus = await proposalSettingsDataSource.getProposalStatus(
    proposal.statusId
  );

  const proposalUsers = await userDataSource.getProposalUsersFull(
    proposal.primaryKey
  );

  const messageData: ProposalMessageData = {
    proposalPk: proposal.primaryKey,
    shortCode: proposal.proposalId,
    title: proposal.title,
    abstract: proposal.abstract,
    members: proposalUsers.map((proposalUser) => ({
      firstName: proposalUser.firstname,
      lastName: proposalUser.lastname,
      email: proposalUser.email,
      id: proposalUser.id.toString(),
    })),
    newStatus: proposalStatus?.shortCode,
  };

  const proposer = await userDataSource.getUser(proposal.proposerId);

  if (proposer) {
    messageData.proposer = {
      firstName: proposer.firstname,
      lastName: proposer.lastname,
      email: proposer.email,
      id: proposer.id.toString(),
    };
  }

  return JSON.stringify(messageData);
};

const getSecondsPerAllocationTimeUnit = (
  timeAllocation: number,
  unit: AllocationTimeUnits
) => {
  // NOTE: Default AllocationTimeUnit is 'Day'. The UI supports Days and Hours.
  switch (unit) {
    case AllocationTimeUnits.Hour:
      return timeAllocation * 60 * 60;
    default:
      return timeAllocation * 24 * 60 * 60;
  }
};

export function createPostToRabbitMQHandler() {
  const rabbitMQ = getRabbitMQMessageBroker();

  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  return async (event: ApplicationEvent) => {
    // if the original method failed
    // there is no point of publishing any event
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW:
      case Event.PROPOSAL_STATUS_CHANGED_BY_USER: {
        const proposal = event.proposal;
        const proposalStatus =
          await proposalSettingsDataSource.getProposalStatus(proposal.statusId);

        const instrument = await instrumentDataSource.getInstrumentByProposalPk(
          proposal.primaryKey
        );

        if (!proposalStatus) {
          logger.logError(`Unknown proposalStatus '${proposal.statusId}'`, {
            proposal,
          });

          return;
        }

        const call = await callDataSource.getCall(proposal.callId);

        if (!call) {
          logger.logError(`Proposal '${proposal.primaryKey}' has no call`, {
            proposal,
          });

          return;
        }

        const proposalAllocatedTime = getSecondsPerAllocationTimeUnit(
          proposal.managementTimeAllocation,
          call.allocationTimeUnit
        );

        // NOTE: maybe use shared types?
        const message = {
          proposalPk: proposal.primaryKey,
          proposalId: proposal.proposalId,
          callId: proposal.callId,
          allocatedTime: proposalAllocatedTime,
          instrumentId: instrument?.id,
          newStatus: proposalStatus.shortCode,
        };

        const schedulerMessage = JSON.stringify(message);

        const fullProposalMessage = await getProposalMessageData(
          event.proposal
        );

        // NOTE: This message is consumed by scichat
        await rabbitMQ.sendMessage(
          Queue.SCICHAT_PROPOSAL,
          event.type,
          fullProposalMessage
        );
        // NOTE: This message is consumed by scicat
        await rabbitMQ.sendMessage(
          Queue.SCICAT_PROPOSAL,
          event.type,
          fullProposalMessage
        );
        // NOTE: Send message for scheduler in a separate queue
        await rabbitMQ.sendMessage(
          Queue.SCHEDULING_PROPOSAL,
          event.type,
          schedulerMessage
        );

        logger.logDebug(
          'Proposal event successfully sent to the message broker',
          { eventType: event.type, fullProposalMessage }
        );

        break;
      }
      case Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED: {
        switch (event.proposal.finalStatus) {
          case ProposalEndStatus.ACCEPTED:
            const json = await getProposalMessageData(event.proposal);

            await rabbitMQ.sendBroadcast(Event.PROPOSAL_ACCEPTED, json);
            break;
          default:
            break;
        }
        break;
      }

      case Event.PROPOSAL_UPDATED: {
        const json = await getProposalMessageData(event.proposal);

        await rabbitMQ.sendBroadcast(Event.PROPOSAL_UPDATED, json);
        break;
      }
      case Event.PROPOSAL_DELETED: {
        const json = await getProposalMessageData(event.proposal);

        await rabbitMQ.sendMessage(Queue.SCHEDULING_PROPOSAL, event.type, json);
        break;
      }
      case Event.PROPOSAL_CREATED: {
        const json = await getProposalMessageData(event.proposal);

        await rabbitMQ.sendBroadcast(Event.PROPOSAL_CREATED, json);
        break;
      }
      case Event.INSTRUMENT_DELETED: {
        const json = JSON.stringify(event.instrument);

        await rabbitMQ.sendMessage(Queue.SCHEDULING_PROPOSAL, event.type, json);
        break;
      }
      case Event.PROPOSAL_SUBMITTED: {
        const json = await getProposalMessageData(event.proposal);

        await rabbitMQ.sendBroadcast(Event.PROPOSAL_SUBMITTED, json);
        break;
      }
      case Event.TOPIC_ANSWERED: {
        const proposal = await proposalDataSource.getProposals({
          questionaryIds: [event.questionarystep.questionaryId],
        });

        if (proposal.proposals.length !== 1) {
          // this checks if the questionary answered is attached to proposal
          return;
        }
        const answers = event.questionarystep.fields.map((field) => {
          return {
            proposalId: proposal.proposals[0].proposalId,
            question: field.question.question,
            questionId: field.question.naturalKey,
            dataType: field.question.dataType,
            answer: field.value,
          };
        });

        const json = JSON.stringify(answers);
        await rabbitMQ.sendBroadcast(Event.TOPIC_ANSWERED, json);
        break;
      }
      case Event.CALL_CREATED: {
        const callJson = JSON.stringify(event.call);

        await rabbitMQ.sendBroadcast(Event.CALL_CREATED, callJson);
        break;
      }
    }
  };
}

export function createListenToRabbitMQHandler() {
  const rabbitMQ = getRabbitMQMessageBroker();

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  rabbitMQ.listenOn(Queue.SCHEDULED_EVENTS, async (type, message) => {
    switch (type) {
      case Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED:
        logger.logDebug(
          `Listener on ${Queue.SCHEDULED_EVENTS}: Received event`,
          {
            type,
            message,
          }
        );

        const scheduledEventToAdd = {
          id: message.id,
          bookingType: message.bookingType,
          startsAt: message.startsAt,
          endsAt: message.endsAt,
          proposalBookingId: message.proposalBookingId,
          proposalPk: message.proposalPk,
          status: message.status,
          localContactId: message.localContact,
        } as ScheduledEventCore;

        await proposalDataSource.addProposalBookingScheduledEvent(
          scheduledEventToAdd
        );

        return;
      case Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED:
        logger.logDebug(
          `Listener on ${Queue.SCHEDULED_EVENTS}: Received event`,
          {
            type,
            message,
          }
        );
        const scheduledEventsToRemove = (
          message.scheduledevents as ScheduledEventCore[]
        ).map((scheduledEvent) => ({
          id: scheduledEvent.id,
          bookingType: scheduledEvent.bookingType,
          startsAt: scheduledEvent.startsAt,
          endsAt: scheduledEvent.endsAt,
          proposalBookingId: scheduledEvent.proposalBookingId,
          proposalPk: scheduledEvent.proposalPk,
          status: scheduledEvent.status,
          localContactId: scheduledEvent.localContactId,
        }));

        await proposalDataSource.removeProposalBookingScheduledEvents(
          scheduledEventsToRemove
        );

        return;

      case Event.PROPOSAL_BOOKING_TIME_ACTIVATED:
      case Event.PROPOSAL_BOOKING_TIME_COMPLETED:
      case Event.PROPOSAL_BOOKING_TIME_UPDATED:
      case Event.PROPOSAL_BOOKING_TIME_REOPENED:
        logger.logDebug(
          `Listener on ${Queue.SCHEDULED_EVENTS}: Received event`,
          {
            type,
            message,
          }
        );
        const scheduledEventToUpdate = {
          id: message.id,
          proposalBookingId: message.proposalBookingId,
          startsAt: message.startsAt,
          endsAt: message.endsAt,
          status: message.status,
          localContactId: message.localContactId,
        } as ScheduledEventCore;

        await proposalDataSource.updateProposalBookingScheduledEvent(
          scheduledEventToUpdate
        );

        return;
      default:
        // captured and logged by duo-message-broker
        // message forwarded to dead-letter queue (DL__SCHEDULED_EVENTS)
        throw 'Received unknown event';
    }
  });
}

export function createSkipPostingHandler() {
  return async () => {
    // no op
  };
}

export function createSkipListeningHandler() {
  return async () => {
    // no op
  };
}
