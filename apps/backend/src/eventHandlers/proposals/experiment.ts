import { RabbitMQMessageBroker } from '@user-office-software/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import {
  ExperimentCreateInput,
  ExperimentDataSource,
} from '../../datasources/ExperimentDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { Event } from '../../events/event.enum';
import { Experiment } from '../../models/Experiment';
import { Sample } from '../../models/Sample';
import {
  EXCHANGE_NAME,
  getProposalMessageData,
  ProposalMessageData,
} from '../messageBroker';

/** Normalised form of either scheduler payload; absent alternatives are null. */
export type ProposalBookingTimeSlotAddedMessage = {
  source: string | null;
  id: number;
  startsAt: Date;
  endsAt: Date;
  experimentId: string | null;
  proposalPk: number | null;
  proposalId: string | null;
  status: string;
  localContactId: number | null;
  localContactOidcSub: string | null;
  instrumentId: number | null;
  instrumentShortCode: string | null;
};

type ExperimentMessageData = {
  experimentId: string;
  experimentPk: number;
  startsAt: Date;
  endsAt: Date;
  status: string;
  proposal?: ProposalMessageData;
  samples?: Pick<Sample, 'id' | 'title'>[];
  instrument?: { id: number; name: string; shortCode: string };
};

export const getExperimentMessageData = async (experiment: Experiment) => {
  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );
  const sampleDataSource = container.resolve<SampleDataSource>(
    Tokens.SampleDataSource
  );
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const proposal = await proposalDataSource.get(experiment.proposalPk);
  const proposalMessageDataString = proposal
    ? await getProposalMessageData(proposal)
    : undefined;
  const proposalMessageData = proposalMessageDataString
    ? JSON.parse(proposalMessageDataString)
    : undefined;

  const experimentHasSamples = await experimentDataSource.getExperimentSamples(
    experiment.experimentPk
  );

  const samples = await Promise.all(
    experimentHasSamples.map(async (ehs) => {
      const sample = await sampleDataSource.getSample(ehs.sampleId);

      return {
        id: ehs.sampleId,
        title: sample?.title || '',
      };
    })
  );

  const instrument = await instrumentDataSource.getInstrument(
    experiment.instrumentId
  );

  const messageData: ExperimentMessageData = {
    experimentId: experiment.experimentId,
    experimentPk: experiment.experimentPk,
    startsAt: experiment.startsAt,
    endsAt: experiment.endsAt,
    status: experiment.status,
    proposal: proposalMessageData,
    samples: samples,
    instrument: instrument
      ? {
          id: instrument.id,
          name: instrument.name,
          shortCode: instrument.shortCode,
        }
      : undefined,
  };

  return JSON.stringify(messageData);
};

const hasMessageField = (message: Record<string, unknown>, field: string) =>
  Object.prototype.hasOwnProperty.call(message, field);

export const parseProposalBookingTimeSlotAddedMessage = (
  message: Record<string, unknown>
): ProposalBookingTimeSlotAddedMessage => {
  const commonFields = ['id', 'startsAt', 'endsAt', 'status'];
  const publicIdentifierFields = [
    'proposalId',
    'instrumentShortCode',
    'localContactOidcSub',
  ];
  const primaryKeyFields = ['proposalPk', 'instrumentId', 'localContactId'];
  const hasPublicIdentifiers = publicIdentifierFields.some((field) =>
    hasMessageField(message, field)
  );
  const hasPrimaryKeys = primaryKeyFields.some((field) =>
    hasMessageField(message, field)
  );

  if (hasPublicIdentifiers === hasPrimaryKeys) {
    throw new Error(
      'Scheduler booking message must contain either public identifiers or UOC primary keys'
    );
  }

  const requiredFields = hasPublicIdentifiers
    ? [
        ...commonFields,
        'source',
        'experimentId',
        'proposalId',
        'instrumentShortCode',
        'localContactOidcSub',
      ]
    : [...commonFields, ...primaryKeyFields];
  const missingFields = requiredFields.filter(
    (field) => !hasMessageField(message, field)
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Scheduler booking message is missing required fields: ${missingFields.join(', ')}`
    );
  }

  if (message.startsAt == null || message.endsAt == null) {
    throw new Error('Scheduler booking message dates cannot be null');
  }

  if (message.id == null) {
    throw new Error('Scheduler booking message id cannot be null');
  }

  if (hasPublicIdentifiers && typeof message.source !== 'string') {
    throw new Error('Public identifier scheduler message requires a source');
  }

  return {
    source: (message.source as string | null | undefined) ?? null,
    id: message.id as number,
    startsAt: message.startsAt as Date,
    endsAt: message.endsAt as Date,
    experimentId: (message.experimentId as string | null | undefined) ?? null,
    proposalPk: (message.proposalPk as number | null | undefined) ?? null,
    proposalId: (message.proposalId as string | null | undefined) ?? null,
    status: message.status as string,
    localContactId:
      (message.localContactId as number | null | undefined) ?? null,
    localContactOidcSub:
      (message.localContactOidcSub as string | null | undefined) ?? null,
    instrumentId: (message.instrumentId as number | null | undefined) ?? null,
    instrumentShortCode:
      (message.instrumentShortCode as string | null | undefined) ?? null,
  };
};

export const handleProposalBookingTimeSlotAdded = async (
  message: any,
  type: Event,
  handleProposalWorkflowEngineChange: (
    eventType: Event,
    proposalPk: number | null
  ) => Promise<void>,
  rabbitMQ: RabbitMQMessageBroker
) => {
  const bookingMessage = parseProposalBookingTimeSlotAddedMessage(message);
  let experimentToAdd: ExperimentCreateInput;

  if (typeof bookingMessage.proposalPk === 'number') {
    experimentToAdd = {
      startsAt: bookingMessage.startsAt,
      endsAt: bookingMessage.endsAt,
      scheduledEventId: bookingMessage.id,
      proposalPk: bookingMessage.proposalPk,
      status: bookingMessage.status as Experiment['status'],
      localContactId: bookingMessage.localContactId,
      instrumentId: bookingMessage.instrumentId as number,
      source: bookingMessage.source,
    };
  } else {
    const proposalId = bookingMessage.proposalId;
    const instrumentShortCode = bookingMessage.instrumentShortCode;
    const externalExperimentId = bookingMessage.experimentId;

    if (!proposalId || !instrumentShortCode || !externalExperimentId) {
      throw new Error(
        'Public identifier scheduler message is missing a proposal ID, instrument short code, or experiment ID'
      );
    }

    const publicProposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const publicInstrumentDataSource = container.resolve<InstrumentDataSource>(
      Tokens.InstrumentDataSource
    );
    const publicUserDataSource = container.resolve<UserDataSource>(
      Tokens.UserDataSource
    );

    const [proposal, instrument] = await Promise.all([
      publicProposalDataSource.getProposalById(proposalId),
      publicInstrumentDataSource.getInstrumentByShortCode(instrumentShortCode),
    ]);

    if (!proposal) {
      throw new Error(`Proposal ${proposalId} was not found`);
    }
    if (!instrument) {
      throw new Error(`Instrument ${instrumentShortCode} was not found`);
    }

    let localContactId: number | null = null;
    if (bookingMessage.localContactOidcSub !== null) {
      const localContact = await publicUserDataSource.getByOIDCSub(
        bookingMessage.localContactOidcSub
      );
      if (!localContact) {
        throw new Error(
          `User with OIDC subject ${bookingMessage.localContactOidcSub} was not found`
        );
      }
      localContactId = localContact.id;
    }

    experimentToAdd = {
      startsAt: bookingMessage.startsAt,
      endsAt: bookingMessage.endsAt,
      scheduledEventId: bookingMessage.id,
      experimentId: externalExperimentId,
      proposalPk: proposal.primaryKey,
      status: bookingMessage.status as Experiment['status'],
      localContactId,
      instrumentId: instrument.id,
      source: bookingMessage.source,
    };
  }

  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const experiment = await experimentDataSource.create(experimentToAdd);

  await handleProposalWorkflowEngineChange(type, experimentToAdd.proposalPk);

  const jsonMessage = await getExperimentMessageData(experiment);
  await rabbitMQ.sendMessageToExchange(
    EXCHANGE_NAME,
    'EXPERIMENT_CREATED',
    jsonMessage
  );
};
