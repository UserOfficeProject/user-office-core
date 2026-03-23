import 'reflect-metadata';
import { RabbitMQMessageBroker } from '@user-office-software/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { Event } from '../events/event.enum';
import {
  createPostToRabbitMQHandler,
  createSkipPostingHandler,
} from './messageBroker';

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
});
