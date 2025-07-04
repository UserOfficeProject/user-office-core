import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { ProposalDataSourceMock } from '../../datasources/mockups/ProposalDataSource';
import { UserDataSourceMock } from '../../datasources/mockups/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { essEmailHandler, EmailTemplateId } from './essEmailHandler';

// Mock MailService
const mockMailService = {
  sendMail: jest.fn(),
};

describe('essEmailHandler', () => {
  let proposalDataSourceMock: ProposalDataSourceMock;
  let coProposerDataSourceMock: CoProposerClaimDataSourceMock;

  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });

  beforeEach(() => {
    // Initialize mocks
    proposalDataSourceMock = container.resolve<ProposalDataSourceMock>(
      Tokens.ProposalDataSource
    );
    container.resolve<UserDataSourceMock>(Tokens.UserDataSource);
    coProposerDataSourceMock = container.resolve<CoProposerClaimDataSourceMock>(
      Tokens.CoProposerClaimDataSource
    );

    // Initialize mock data sources that have init method
    proposalDataSourceMock.init();
    coProposerDataSourceMock.init();

    // Reset mocks
    mockMailService.sendMail.mockClear();
    mockMailService.sendMail.mockResolvedValue({ success: true });
  });

  test('mailService should be invoked when PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED event is sent', async () => {
    const inviteEmail = faker.internet.email();

    const mockEvent = {
      type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
      invite: {
        id: 1, // This will match the default mock data
        email: inviteEmail,
        code: faker.string.alphanumeric(10),
        claimedByUserId: 2,
        createdByUserId: 1,
        isEmailSent: false,
      },
      isRejection: false,
    } as ApplicationEvent;

    await essEmailHandler(mockEvent);

    expect(mockMailService.sendMail).toHaveBeenCalledWith({
      content: {
        template_id: EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED,
      },
      substitution_data: {
        piPreferredname: expect.any(String),
        piLastname: expect.any(String),
        email: inviteEmail,
        proposalTitle: expect.any(String),
        proposalId: expect.any(String),
        claimerPreferredname: expect.any(String),
        claimerLastname: expect.any(String),
      },
      recipients: [{ address: expect.any(String) }],
    });
  });
});
