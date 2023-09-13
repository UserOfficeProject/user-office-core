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
import { Country } from '../models/Country';
import { Institution } from '../models/Institution';
import { Instrument } from '../models/Instrument';
import { Proposal, ProposalEndStatus } from '../models/Proposal';
import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { markProposalsEventAsDoneAndCallWorkflowEngine } from '../workflowEngine';

const EXCHANGE_NAME =
  process.env.CORE_EXCHANGE_NAME || 'user_office_backend.fanout';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  oidcSub: string | null;
  oauthIssuer: string | null;
  institution: Institution;
  country: Country;
};

type ProposalMessageData = {
  abstract: string;
  allocatedTime: number;
  callId: number;
  instrument?: Pick<Instrument, 'id' | 'shortCode'>;
  members: Member[];
  newStatus?: string;
  proposalPk: number;
  proposer?: Member;
  shortCode: string;
  title: string;
  instrumentId?: number; // instrumentId is here for backwards compatibility.
  submitted: boolean;
};

let rabbitMQCachedBroker: null | RabbitMQMessageBroker = null;

const getRabbitMQMessageBroker = async () => {
  if (rabbitMQCachedBroker === null) {
    rabbitMQCachedBroker = await createRabbitMQMessageBroker();
  }

  return rabbitMQCachedBroker;
};

const createRabbitMQMessageBroker = async () => {
  try {
    const messageBroker = new RabbitMQMessageBroker();
    await messageBroker.setup({
      hostname: process.env.RABBITMQ_HOSTNAME,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      vhost: process.env.RABBITMQ_VIRTUAL_HOST ?? '/',
    });

    return messageBroker;
  } catch (error) {
    throw new Error(
      `Something went wrong while setting up the message broker: ${error}`
    );
  }
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
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  const proposalStatus = await proposalSettingsDataSource.getProposalStatus(
    proposal.statusId
  );

  const proposalUsersWithInstitution =
    await userDataSource.getProposalUsersWithInstitution(proposal.primaryKey);
  const maybeInstrument = await instrumentDataSource.getInstrumentByProposalPk(
    proposal.primaryKey
  );

  const call = await callDataSource.getCall(proposal.callId);
  if (!call) {
    throw new Error('Call not found');
  }

  const proposalAllocatedTime = getSecondsPerAllocationTimeUnit(
    proposal.managementTimeAllocation,
    call.allocationTimeUnit
  );

  const instrument = maybeInstrument
    ? {
        id: maybeInstrument.id,
        shortCode: maybeInstrument.shortCode,
      }
    : undefined;
  const messageData: ProposalMessageData = {
    proposalPk: proposal.primaryKey,
    shortCode: proposal.proposalId,
    instrument: instrument,
    title: proposal.title,
    abstract: proposal.abstract,
    callId: call.id,
    allocatedTime: proposalAllocatedTime,
    instrumentId: instrument?.id,
    members: proposalUsersWithInstitution.map(
      (proposalUserWithInstitution) => ({
        firstName: proposalUserWithInstitution.user.firstname,
        lastName: proposalUserWithInstitution.user.lastname,
        email: proposalUserWithInstitution.user.email,
        id: proposalUserWithInstitution.user.id.toString(),
        oidcSub: proposalUserWithInstitution.user.oidcSub,
        oauthIssuer: proposalUserWithInstitution.user.oauthIssuer,
        institution: proposalUserWithInstitution.institution,
        country: proposalUserWithInstitution.country,
      })
    ),
    newStatus: proposalStatus?.shortCode,
    submitted: proposal.submitted,
  };
  const proposerWithInstitution = await userDataSource.getUserWithInstitution(
    proposal.proposerId
  );
  if (proposerWithInstitution) {
    messageData.proposer = {
      firstName: proposerWithInstitution.user.firstname,
      lastName: proposerWithInstitution.user.lastname,
      email: proposerWithInstitution.user.email,
      id: proposerWithInstitution.user.id.toString(),
      oidcSub: proposerWithInstitution.user.oidcSub,
      oauthIssuer: proposerWithInstitution.user.oauthIssuer,
      institution: proposerWithInstitution.institution,
      country: proposerWithInstitution.country,
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

export async function createPostToRabbitMQHandler() {
  const rabbitMQ = await getRabbitMQMessageBroker();

  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
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

        if (!proposalStatus) {
          logger.logError(`Unknown proposalStatus '${proposal.statusId}'`, {
            proposal,
          });

          return;
        }

        const jsonMessage = await getProposalMessageData(event.proposal);

        rabbitMQ.sendMessageToExchange(EXCHANGE_NAME, event.type, jsonMessage);

        logger.logDebug(
          'Proposal event successfully sent to the message broker',
          { eventType: event.type, fullProposalMessage: jsonMessage }
        );

        break;
      }
      case Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED: {
        switch (event.proposal.finalStatus) {
          case ProposalEndStatus.ACCEPTED:
            const jsonMessage = await getProposalMessageData(event.proposal);

            await rabbitMQ.sendMessageToExchange(
              EXCHANGE_NAME,
              Event.PROPOSAL_ACCEPTED,
              jsonMessage
            );
            break;
          default:
            break;
        }
        break;
      }

      case Event.PROPOSAL_UPDATED:
      case Event.PROPOSAL_DELETED:
      case Event.PROPOSAL_CREATED:
      case Event.PROPOSAL_SUBMITTED: {
        const jsonMessage = await getProposalMessageData(event.proposal);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.INSTRUMENT_CREATED:
      case Event.INSTRUMENT_UPDATED:
      case Event.INSTRUMENT_DELETED: {
        const jsonMessage = JSON.stringify(event.instrument);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
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

        const jsonMessage = JSON.stringify(answers);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.CALL_CREATED: {
        const jsonMessage = JSON.stringify(event.call);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.USER_UPDATED:
      case Event.USER_DELETED: {
        const jsonMessage = JSON.stringify(event.user);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
    }
  };
}

export async function createListenToRabbitMQHandler() {
  const EVENT_SCHEDULING_QUEUE_NAME = process.env
    .EVENT_SCHEDULING_QUEUE_NAME as Queue;
  const SCHEDULER_EXCHANGE_NAME = process.env.SCHEDULER_EXCHANGE_NAME;

  if (!SCHEDULER_EXCHANGE_NAME) {
    throw new Error('SCHEDULER_EXCHANGE_NAME environment variable not set');
  }

  if (!EVENT_SCHEDULING_QUEUE_NAME) {
    throw new Error('EVENT_SCHEDULING_QUEUE_NAME env variable not set');
  }

  const rabbitMQ = await getRabbitMQMessageBroker();

  rabbitMQ.addQueueToExchangeBinding(
    EVENT_SCHEDULING_QUEUE_NAME,
    SCHEDULER_EXCHANGE_NAME
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const handleWorkflowEngineChange = async (
    eventType: Event,
    proposalPk: number | null
  ) => {
    if (!proposalPk) {
      throw new Error('Proposal id not found in the message');
    }

    const updatedProposals =
      await markProposalsEventAsDoneAndCallWorkflowEngine(eventType, [
        proposalPk,
      ]);

    if (updatedProposals) {
      for (const updatedProposal of updatedProposals) {
        if (!updatedProposal) {
          return;
        }

        const fullProposalMessage = await getProposalMessageData(
          updatedProposal
        );

        /**
         * NOTE: After running the workflow engine, we send the message to the exchange
         */
        rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
          fullProposalMessage
        );
      }
    }
  };

  rabbitMQ.listenOn(EVENT_SCHEDULING_QUEUE_NAME, async (type, message) => {
    switch (type) {
      case Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED:
        try {
          logger.logDebug(
            `Listener on ${EVENT_SCHEDULING_QUEUE_NAME}: Received event`,
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

          await handleWorkflowEngineChange(
            type,
            scheduledEventToAdd.proposalPk
          );
        } catch (error) {
          logger.logException(`Error while handling event ${type}: `, error);
        }

        return;
      case Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED:
        try {
          logger.logDebug(
            `Listener on ${EVENT_SCHEDULING_QUEUE_NAME}: Received event`,
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

          await handleWorkflowEngineChange(
            type,
            scheduledEventsToRemove[0].proposalPk
          );
        } catch (error) {
          logger.logException(`Error while handling event ${type}: `, error);
        }

        return;

      case Event.PROPOSAL_BOOKING_TIME_ACTIVATED:
      case Event.PROPOSAL_BOOKING_TIME_COMPLETED:
      case Event.PROPOSAL_BOOKING_TIME_UPDATED:
      case Event.PROPOSAL_BOOKING_TIME_REOPENED:
        try {
          logger.logDebug(
            `Listener on ${EVENT_SCHEDULING_QUEUE_NAME}: Received event`,
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
            proposalPk: message.proposalPk,
          } as ScheduledEventCore;

          await proposalDataSource.updateProposalBookingScheduledEvent(
            scheduledEventToUpdate
          );

          await handleWorkflowEngineChange(
            type,
            scheduledEventToUpdate.proposalPk
          );
        } catch (error) {
          logger.logException(`Error while handling event ${type}: `, error);
        }

        return;
      default:
        // captured and logged by duo-message-broker
        // message forwarded to dead-letter queue (DL__${EVENT_SCHEDULING_QUEUE_NAME})
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
