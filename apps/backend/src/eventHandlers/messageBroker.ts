import { logger } from '@user-office-software/duo-logger';
import {
  Queue,
  RabbitMQMessageBroker,
} from '@user-office-software/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import {
  DataAccessUsersDataSource,
  UserWithInstitution,
} from '../datasources/DataAccessUsersDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventHandler } from '../events/eventBus';
import { AllocationTimeUnits } from '../models/Call';
import { Country } from '../models/Country';
import { Experiment } from '../models/Experiment';
import { Institution } from '../models/Institution';
import { Proposal } from '../models/Proposal';
import { Visit } from '../models/Visit';
import { VisitRegistrationStatus } from '../models/VisitRegistration';
import { markProposalsEventAsDoneAndCallWorkflowEngine } from '../workflowEngine/proposal';

export const QUEUE_NAME =
  (process.env.RABBITMQ_CORE_QUEUE_NAME as Queue) ||
  'user_office_backend.queue';

export const EXCHANGE_NAME =
  process.env.RABBITMQ_CORE_EXCHANGE_NAME || 'user_office_backend.fanout';

enum RABBITMQ_VISIT_EVENT_TYPE {
  VISIT_CREATED = 'VISIT_CREATED',
  VISIT_DELETED = 'VISIT_DELETED',
}

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
  callId: number;
  instruments?: { id: number; shortCode: string; allocatedTime: number }[];
  members: Member[];
  dataAccessUsers: Member[];
  visitors: Member[];
  newStatus?: string;
  proposalPk: number;
  proposer?: Member;
  shortCode: string;
  title: string;
  submitted: boolean;
};

let rabbitMQCachedBroker: null | RabbitMQMessageBroker = null;

export const getRabbitMQMessageBroker = async () => {
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

export function createListenToQueueHandler() {
  // return the mapped implementation
  return container.resolve<EventHandler<ApplicationEvent>>(
    Tokens.ListenToMessageQueue
  );
}

export const getProposalMessageData = async (proposal: Proposal) => {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  const dataAccessUsersDataSource =
    container.resolve<DataAccessUsersDataSource>(
      Tokens.DataAccessUsersDataSource
    );

  const statusDataSource = container.resolve<StatusDataSource>(
    Tokens.StatusDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  const proposalStatus = await statusDataSource.getStatus(proposal.statusId);

  const proposalUsersWithInstitution =
    await userDataSource.getProposalUsersWithInstitution(proposal.primaryKey);
  const dataAccessUsersWithInstitution =
    await dataAccessUsersDataSource.getDataAccessUsersWithInstitution(
      proposal.primaryKey
    );

  const visitorsWithInstitution =
    await userDataSource.getApprovedProposalVisitorsWithInstitution(
      proposal.primaryKey
    );

  const maybeInstruments =
    await instrumentDataSource.getInstrumentsByProposalPk(proposal.primaryKey);

  const call = await callDataSource.getCall(proposal.callId);
  if (!call) {
    throw new Error('Call not found');
  }

  const instruments = maybeInstruments?.length
    ? maybeInstruments.map((instr) => ({
        id: instr.id,
        shortCode: instr.shortCode,
        allocatedTime: getSecondsPerAllocationTimeUnit(
          instr.managementTimeAllocation,
          call.allocationTimeUnit
        ),
      }))
    : undefined;

  // Helper function to map user with institution to Member
  const mapUserWithInstitutionToMember = (
    userWithInstitution: UserWithInstitution
  ): Member => ({
    firstName: userWithInstitution.user.firstname,
    lastName: userWithInstitution.user.lastname,
    email: userWithInstitution.user.email,
    id: userWithInstitution.user.id.toString(),
    oidcSub: userWithInstitution.user.oidcSub,
    oauthIssuer: userWithInstitution.user.oauthIssuer,
    institution: userWithInstitution.institution,
    country: userWithInstitution.country,
  });

  const messageData: ProposalMessageData = {
    proposalPk: proposal.primaryKey,
    shortCode: proposal.proposalId,
    instruments: instruments,
    title: proposal.title,
    abstract: proposal.abstract,
    callId: call.id,
    members: proposalUsersWithInstitution.map(mapUserWithInstitutionToMember),
    dataAccessUsers: dataAccessUsersWithInstitution.map(
      mapUserWithInstitutionToMember
    ),
    visitors: visitorsWithInstitution.map(mapUserWithInstitutionToMember),
    newStatus: proposalStatus?.shortCode,
    submitted: proposal.submitted,
  };

  const proposerWithInstitution = await userDataSource.getUserWithInstitution(
    proposal.proposerId
  );
  if (proposerWithInstitution) {
    messageData.proposer = mapUserWithInstitutionToMember(
      proposerWithInstitution
    );
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
    case AllocationTimeUnits.Week:
      return timeAllocation * 7 * 24 * 60 * 60;
    default:
      return timeAllocation * 24 * 60 * 60;
  }
};

export async function createPostToRabbitMQHandler() {
  const rabbitMQ = await getRabbitMQMessageBroker();

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const templateDataSource = container.resolve<TemplateDataSource>(
    Tokens.TemplateDataSource
  );

  const coProposerClaimDataSource =
    container.resolve<CoProposerClaimDataSource>(
      Tokens.CoProposerClaimDataSource
    );

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  return async (event: ApplicationEvent) => {
    // if the original method failed
    // there is no point of publishing any event
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
      case Event.PROPOSAL_UPDATED:
      case Event.PROPOSAL_SUBMITTED:
      case Event.PROPOSAL_ACCEPTED:
      case Event.PROPOSAL_DELETED:
      case Event.PROPOSAL_STATUS_ACTION_EXECUTED: {
        const jsonMessage = await getProposalMessageData(event.proposal);
        await rabbitMQ.sendMessageToExchange(
          event.exchange || EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED: {
        const { invite } = event;

        const claims = await coProposerClaimDataSource.findByInviteId(
          invite.id
        );

        for (const claim of claims) {
          const proposal = await proposalDataSource.get(claim.proposalPk);
          if (!proposal) {
            return;
          }

          const jsonMessage = await getProposalMessageData(proposal);
          await rabbitMQ.sendMessageToExchange(
            EXCHANGE_NAME,
            Event.PROPOSAL_UPDATED,
            jsonMessage
          );
        }

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
      case Event.EMAIL_TEMPLATE_CREATED:
      case Event.EMAIL_TEMPLATE_UPDATED:
      case Event.EMAIL_TEMPLATE_DELETED: {
        const jsonMessage = JSON.stringify(event.emailtemplate);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.TOPIC_ANSWERED: {
        const proposal = await proposalDataSource.getProposals({
          questionaryIds: event.array.map((a) => a.questionaryId),
        });

        if (proposal.proposals.length !== 1) {
          // this checks if the questionary answered is attached to proposal
          return;
        }
        const answers = event.array.map(async (answer) => {
          const question = await templateDataSource.getQuestion(
            answer.questionId
          );

          return {
            proposalId: proposal.proposals[0].proposalId,
            question: question,
            questionId: answer.questionId,
            dataType: question?.dataType,
            answer: answer.answer,
          };
        });

        const jsonMessage = JSON.stringify(await Promise.all(answers));

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
      case Event.PROPOSAL_FAPS_SELECTED: {
        const jsonMessage = JSON.stringify(event.proposalpks);

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type,
          jsonMessage
        );
        break;
      }
      case Event.PROPOSAL_INSTRUMENTS_SELECTED: {
        const jsonMessage = JSON.stringify(event.instrumentshasproposals);

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
      case Event.VISIT_REGISTRATION_APPROVED:
      case Event.VISIT_REGISTRATION_CANCELLED: {
        const { visitregistration: visitRegistration } = event;
        const proposal = await proposalDataSource.getProposalByVisitId(
          visitRegistration.visitId
        );
        const proposalPayload = await getProposalMessageData(proposal);
        const user = await userDataSource.getUser(visitRegistration.userId);
        const jsonMessage = JSON.stringify({
          startAt: visitRegistration.startsAt,
          endAt: visitRegistration.endsAt,
          visitorId: user!.oidcSub,
          proposal: JSON.parse(proposalPayload),
        });

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          event.type === Event.VISIT_REGISTRATION_APPROVED
            ? RABBITMQ_VISIT_EVENT_TYPE.VISIT_CREATED
            : RABBITMQ_VISIT_EVENT_TYPE.VISIT_DELETED,
          jsonMessage
        );

        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          Event.PROPOSAL_UPDATED,
          proposalPayload
        );
        break;
      }
      case Event.DATA_ACCESS_USERS_UPDATED: {
        const { proposalPKey } = event;

        const proposal = await proposalDataSource.get(proposalPKey);

        const jsonMessage = await getProposalMessageData(proposal!);
        await rabbitMQ.sendMessageToExchange(
          EXCHANGE_NAME,
          Event.PROPOSAL_UPDATED,
          jsonMessage
        );
        break;
      }
    }
  };
}

export async function createListenToRabbitMQHandler() {
  if (!QUEUE_NAME || !EXCHANGE_NAME) {
    throw new Error('RabbitMQ environment variables not set');
  }

  const rabbitMQ = await getRabbitMQMessageBroker();

  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const visitDataSource = container.resolve<VisitDataSource>(
    Tokens.VisitDataSource
  );

  const handleWorkflowEngineChange = async (
    eventType: Event,
    proposalPk: number | null
  ) => {
    if (!proposalPk) {
      throw new Error('Proposal id not found in the message');
    }

    await markProposalsEventAsDoneAndCallWorkflowEngine(eventType, [
      proposalPk,
    ]);
  };

  const cancelVisit = async (visit: Visit) => {
    const visitRegistrations = await visitDataSource.getRegistrations({
      visitId: visit.id,
    });

    const eventBus = resolveApplicationEventBus();

    for (const registration of visitRegistrations) {
      const oldStatus = registration.status;
      await visitDataSource.updateRegistration({
        visitId: registration.visitId,
        userId: registration.userId,
        status: VisitRegistrationStatus.CANCELLED_BY_FACILITY,
      });

      if (oldStatus === VisitRegistrationStatus.APPROVED) {
        await eventBus.publish({
          type: Event.VISIT_REGISTRATION_CANCELLED,
          visitregistration: registration,
          key: 'visitregistration',
          loggedInUserId: null,
          isRejection: false,
        });
      }
    }
  };
  rabbitMQ.listenOn(QUEUE_NAME, async (type, message) => {
    switch (type) {
      case Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED:
        try {
          logger.logDebug(`Listener on ${QUEUE_NAME}: Received event`, {
            type,
            message,
          });

          const experimentToAdd = {
            startsAt: message.startsAt,
            endsAt: message.endsAt,
            scheduledEventId: message.id,
            proposalPk: message.proposalPk,
            status: message.status,
            localContactId: message.localContactId,
            instrumentId: message.instrumentId,
          } as Omit<
            Experiment,
            'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
          >;

          await experimentDataSource.create(experimentToAdd);

          await handleWorkflowEngineChange(type, experimentToAdd.proposalPk);
        } catch (error) {
          logger.logException(`Error while handling event ${type}: `, error);
        }

        return;
      case Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED:
        try {
          logger.logDebug(`Listener on ${QUEUE_NAME}: Received event`, {
            type,
            message,
          });

          const scheduledEvents = message.scheduledevents as {
            id: number;
            proposalPk: number;
          }[];

          for (const scheduledEvent of scheduledEvents) {
            const visit = await visitDataSource.getVisitByExperimentPk(
              scheduledEvent.id
            );
            if (visit) {
              await cancelVisit(visit);
            }
          }

          scheduledEvents.forEach(async (scheduledEvent) => {
            await experimentDataSource.deleteByScheduledEventId(
              scheduledEvent.id
            );
          });

          await handleWorkflowEngineChange(type, scheduledEvents[0].proposalPk);
        } catch (error) {
          logger.logException(`Error while handling event ${type}: `, error);
        }

        return;

      case Event.PROPOSAL_BOOKING_TIME_ACTIVATED:
      case Event.PROPOSAL_BOOKING_TIME_COMPLETED:
      case Event.PROPOSAL_BOOKING_TIME_UPDATED:
      case Event.PROPOSAL_BOOKING_TIME_REOPENED:
        try {
          logger.logDebug(`Listener on ${QUEUE_NAME}: Received event`, {
            type,
            message,
          });

          await experimentDataSource.updateByScheduledEventId({
            startsAt: message.startsAt,
            endsAt: message.endsAt,
            status: message.status,
            localContactId: message.localContactId,
            scheduledEventId: message.id,
          } as Omit<
            Experiment,
            'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
          >);
          await handleWorkflowEngineChange(type, message.proposalPk as number);
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
