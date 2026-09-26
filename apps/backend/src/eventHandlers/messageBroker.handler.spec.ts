import 'reflect-metadata';
import { RabbitMQMessageBroker } from '@user-office-software/duo-message-broker';
import { container } from 'tsyringe';

import {
  createListenToRabbitMQHandler,
  createPostToRabbitMQHandler,
  createSkipPostingHandler,
} from './messageBroker';
import proposalWorkflowEntity from './workflowEntities/proposal';
import * as workflowHandlerModule from './workflowHandler';
import { Tokens } from '../config/Tokens';
import {
  ExperimentDataSourceMock,
  OngoingExperiment,
} from '../datasources/mockups/ExperimentDataSource';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { Event } from '../events/event.enum';
import { WorkflowEngine } from '../workflowEngine';

const buildProposalSubmittedEvent = (isRejection = false) => ({
  type: Event.PROPOSAL_SUBMITTED,
  key: 'proposal_submitted',
  loggedInUserId: 1,
  isRejection,
  proposal: dummyProposal,
});

describe('messageBroker handlers', () => {
  let mockProposalDataSource: ProposalDataSourceMock;
  let mockSampleDataSource: SampleDataSourceMock;
  let mockSendMessageToExchange: jest.SpyInstance;

  beforeEach(() => {
    mockProposalDataSource = container.resolve(Tokens.ProposalDataSource);
    mockSampleDataSource = container.resolve(Tokens.SampleDataSource);

    mockProposalDataSource.init();
    mockSampleDataSource.init();

    jest
      .spyOn(RabbitMQMessageBroker.prototype, 'setup')
      .mockResolvedValue(undefined);

    mockSendMessageToExchange = jest
      .spyOn(RabbitMQMessageBroker.prototype, 'sendMessageToExchange')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPostToRabbitMQHandler (STFC / ESS / ELI config)', () => {
    it('should send a message to the exchange when PROPOSAL_SUBMITTED fires', async () => {
      const handler = await createPostToRabbitMQHandler();

      await handler(buildProposalSubmittedEvent() as any);

      expect(mockSendMessageToExchange).toHaveBeenCalledTimes(1);
      expect(mockSendMessageToExchange).toHaveBeenCalledWith(
        expect.any(String),
        Event.PROPOSAL_SUBMITTED,
        expect.any(String)
      );
    });

    it('should send a message containing the correct proposal data', async () => {
      const handler = await createPostToRabbitMQHandler();

      await handler(buildProposalSubmittedEvent() as any);

      const sentMessage = JSON.parse(
        mockSendMessageToExchange.mock.calls[0][2]
      );

      expect(sentMessage.proposalPk).toBe(dummyProposal.primaryKey);
      expect(sentMessage.shortCode).toBe(dummyProposal.proposalId);
      expect(sentMessage.proposer).toBeDefined();
      expect(sentMessage.proposer.institution).toBeDefined();
      expect(sentMessage.proposer.country).toBeDefined();
      expect(sentMessage.members).toBeDefined();
    });

    it('should not send a message when the event is a rejection', async () => {
      const handler = await createPostToRabbitMQHandler();

      await handler(buildProposalSubmittedEvent(true) as any);

      expect(mockSendMessageToExchange).not.toHaveBeenCalled();
    });
  });

  describe('createSkipPostingHandler (Default config)', () => {
    it('should not send any message when PROPOSAL_SUBMITTED fires', async () => {
      const handler = createSkipPostingHandler();

      await handler();

      expect(mockSendMessageToExchange).not.toHaveBeenCalled();
    });
  });

  describe('createListenToRabbitMQHandler (ESS / ELI / DLS config)', () => {
    let listenCallback: (type: Event, message: any) => Promise<void>;
    let startWorkflowSpy: jest.SpyInstance;
    let mockExperimentDataSource: ExperimentDataSourceMock;
    let mockVisitDataSource: VisitDataSourceMock;

    beforeEach(async () => {
      mockExperimentDataSource = container.resolve(Tokens.ExperimentDataSource);
      mockVisitDataSource = container.resolve(Tokens.VisitDataSource);

      mockVisitDataSource.init();
      jest
        .spyOn(mockExperimentDataSource, 'create')
        .mockResolvedValue(OngoingExperiment);
      jest
        .spyOn(mockExperimentDataSource, 'updateByScheduledEventId')
        .mockResolvedValue(OngoingExperiment);
      jest
        .spyOn(mockExperimentDataSource, 'deleteByScheduledEventId')
        .mockResolvedValue(OngoingExperiment);
      jest
        .spyOn(mockVisitDataSource, 'getVisitByExperimentPk')
        .mockResolvedValue(null);

      jest
        .spyOn(RabbitMQMessageBroker.prototype, 'listenOn')
        .mockImplementation(async (_queue, cb: any) => {
          listenCallback = cb;
        });

      startWorkflowSpy = jest
        .spyOn(workflowHandlerModule, 'startWorkflow')
        .mockResolvedValue([]);
    });

    it('should trigger startWorkflow with proposal workflow entity and the received event on PROPOSAL_BOOKING_TIME_SLOT_ADDED', async () => {
      await createListenToRabbitMQHandler();

      const bookingMessage = {
        id: 101,
        startsAt: new Date('2026-06-01'),
        endsAt: new Date('2026-06-02'),
        proposalPk: dummyProposal.primaryKey,
        status: 'DRAFT',
        localContactId: 1,
        instrumentId: 1,
      };

      await listenCallback(
        Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED,
        bookingMessage
      );

      expect(startWorkflowSpy).toHaveBeenCalledTimes(1);
      expect(startWorkflowSpy).toHaveBeenCalledWith(
        { type: Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED },
        dummyProposal.primaryKey,
        proposalWorkflowEntity
      );
    });

    it('should trigger startWorkflow on PROPOSAL_BOOKING_TIME_SLOTS_REMOVED', async () => {
      await createListenToRabbitMQHandler();

      const bookingMessage = {
        scheduledevents: [{ id: 101, proposalPk: dummyProposal.primaryKey }],
      };

      await listenCallback(
        Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED,
        bookingMessage
      );

      expect(startWorkflowSpy).toHaveBeenCalledTimes(1);
      expect(startWorkflowSpy).toHaveBeenCalledWith(
        { type: Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED },
        dummyProposal.primaryKey,
        proposalWorkflowEntity
      );
    });

    it('should trigger startWorkflow on PROPOSAL_BOOKING_TIME_ACTIVATED', async () => {
      await createListenToRabbitMQHandler();

      const bookingMessage = {
        id: 101,
        startsAt: new Date('2026-06-01'),
        endsAt: new Date('2026-06-02'),
        proposalPk: dummyProposal.primaryKey,
        status: 'ACTIVE',
        localContactId: 1,
      };

      await listenCallback(
        Event.PROPOSAL_BOOKING_TIME_ACTIVATED,
        bookingMessage
      );

      expect(startWorkflowSpy).toHaveBeenCalledTimes(1);
      expect(startWorkflowSpy).toHaveBeenCalledWith(
        { type: Event.PROPOSAL_BOOKING_TIME_ACTIVATED },
        dummyProposal.primaryKey,
        proposalWorkflowEntity
      );
    });

    it('should execute onWorkflowStatusChange when workflow engine transitions proposal status during a booking event', async () => {
      startWorkflowSpy.mockRestore();

      const updatedEntities = [
        {
          entityId: dummyProposal.primaryKey,
          prevStatusId: 1,
          nextStatusId: 2,
          workflowStatusConnectionId: 10,
        },
      ];

      jest
        .spyOn(WorkflowEngine.prototype, 'run')
        .mockResolvedValue(updatedEntities);

      const onWorkflowStatusChangeSpy = jest
        .spyOn(proposalWorkflowEntity, 'onWorkflowStatusChange')
        .mockResolvedValue(undefined);

      await createListenToRabbitMQHandler();

      const bookingMessage = {
        id: 101,
        startsAt: new Date('2026-06-01'),
        endsAt: new Date('2026-06-02'),
        proposalPk: dummyProposal.primaryKey,
        status: 'DRAFT',
        localContactId: 1,
        instrumentId: 1,
      };

      await listenCallback(
        Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED,
        bookingMessage
      );

      expect(onWorkflowStatusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onWorkflowStatusChangeSpy).toHaveBeenCalledWith(updatedEntities);
    });
  });
});
