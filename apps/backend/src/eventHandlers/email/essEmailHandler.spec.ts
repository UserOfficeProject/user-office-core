import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { ProposalDataSourceMock } from '../../datasources/mockups/ProposalDataSource';
import {
  UserDataSourceMock,
  dummyUser,
} from '../../datasources/mockups/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Invite } from '../../models/Invite';
import { EmailTemplateId, essEmailHandler } from './essEmailHandler';

// Mock MailService
const mockMailService = {
  sendMail: jest.fn(),
};

describe('essEmailHandler co-proposer invites', () => {
  let proposalDataSourceMock: ProposalDataSourceMock;
  let coProposerDataSourceMock: CoProposerClaimDataSourceMock;
  let userDataSourceMock: UserDataSourceMock;
  let logErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });

  beforeEach(() => {
    // Initialize mocks
    proposalDataSourceMock = container.resolve<ProposalDataSourceMock>(
      Tokens.ProposalDataSource
    );
    userDataSourceMock = container.resolve<UserDataSourceMock>(
      Tokens.UserDataSource
    );
    coProposerDataSourceMock = container.resolve<CoProposerClaimDataSourceMock>(
      Tokens.CoProposerClaimDataSource
    );

    // Initialize mock data sources that have init method
    proposalDataSourceMock.init();
    coProposerDataSourceMock.init();

    // Set up spies on logger methods
    logErrorSpy = jest.spyOn(logger, 'logError').mockImplementation(() => {});

    mockMailService.sendMail.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Restore all spies to their original implementations
    jest.restoreAllMocks();
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

  test('mailService should be invoked when PROPOSAL_VISIT_REGISTRATION_INVITES_UPDATED event is sent', async () => {
    const inviteEmail = faker.internet.email();
    const inviterId = 1;
    const inviteId = 123;
    const redeemCode = faker.string.alphanumeric(10);

    // Mock UserDataSource.getBasicUserInfo to return a dummy inviter
    const userDataSourceMock = container.resolve<UserDataSourceMock>(
      Tokens.UserDataSource
    );
    jest.spyOn(userDataSourceMock, 'getBasicUserInfo').mockResolvedValue({
      id: inviterId,
      firstname: 'Inviter',
      lastname: 'User',
      institution: 'TestOrg',
      email: 'inviter@email.com',
    } as any);

    const mockEvent = {
      type: Event.PROPOSAL_VISIT_REGISTRATION_INVITES_UPDATED,
      array: [
        {
          id: inviteId,
          email: inviteEmail,
          code: redeemCode,
          createdByUserId: inviterId,
          isEmailSent: false,
        },
      ],
      isRejection: false,
    } as ApplicationEvent;

    await essEmailHandler(mockEvent);

    expect(mockMailService.sendMail).toHaveBeenCalledWith({
      content: {
        template_id:
          EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_VISIT_REGISTRATION,
      },
      substitution_data: {
        email: inviteEmail,
        inviterName: 'Inviter',
        inviterLastname: 'User',
        inviterOrg: 'TestOrg',
        redeemCode: redeemCode,
      },
      recipients: [{ address: inviteEmail }],
    });
  });

  it('should log error when proposal is not found', async () => {
    const mockInvite = new Invite(
      1,
      faker.string.alphanumeric(8),
      dummyUser.email,
      new Date(),
      dummyUser.id,
      new Date(),
      dummyUser.id,
      false,
      null,
      EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED
    );

    // Mock proposalDataSource.get to return null
    jest.spyOn(proposalDataSourceMock, 'get').mockResolvedValue(null);

    const event: ApplicationEvent = {
      type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
      invite: mockInvite,
      key: 'invite',
      loggedInUserId: 3,
      isRejection: false,
      proposalPKey: 1,
    };
    const sendMailsSpy = jest.spyOn(mockMailService, 'sendMail');

    await essEmailHandler(event);

    expect(sendMailsSpy).not.toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalledWith(
      'No proposal found when trying to send invite accepted email',
      expect.objectContaining({
        claim: expect.any(Object),
        event: expect.objectContaining({
          type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
        }),
      })
    );
  });

  it('should log error when principal investigator is not found', async () => {
    const mockInvite = new Invite(
      1,
      faker.string.alphanumeric(8),
      dummyUser.email,
      new Date(),
      dummyUser.id,
      new Date(),
      dummyUser.id,
      false,
      null,
      EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED
    );

    // Mock userDataSource.getUser to return null for the principal investigator (first call)
    const getUserMock = jest.spyOn(userDataSourceMock, 'getUser');
    getUserMock
      .mockResolvedValueOnce(null) // First call for principal investigator
      .mockResolvedValue(dummyUser); // Subsequent calls

    const event: ApplicationEvent = {
      type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
      invite: mockInvite,
      key: 'invite',
      loggedInUserId: 3,
      isRejection: false,
      proposalPKey: 1,
    };
    const sendMailsSpy = jest.spyOn(mockMailService, 'sendMail');

    await essEmailHandler(event);

    expect(sendMailsSpy).not.toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalledWith(
      'No principal investigator found when trying to send invite accepted email',
      expect.objectContaining({
        claim: expect.any(Object),
        event: expect.objectContaining({
          type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
        }),
      })
    );
  });

  it('should log error when claimer is not found', async () => {
    const mockInvite = new Invite(
      1,
      faker.string.alphanumeric(8),
      dummyUser.email,
      new Date(),
      dummyUser.id,
      new Date(),
      dummyUser.id,
      false,
      null,
      EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED
    );

    // Mock userDataSource.getUser to return dummyUser for principal investigator but null for claimer
    const getUserMock = jest.spyOn(userDataSourceMock, 'getUser');
    getUserMock
      .mockResolvedValueOnce(dummyUser) // First call for principal investigator
      .mockResolvedValueOnce(null); // Second call for claimer

    const event: ApplicationEvent = {
      type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
      invite: mockInvite,
      key: 'invite',
      loggedInUserId: 3,
      isRejection: false,
      proposalPKey: 1,
    };
    const sendMailsSpy = jest.spyOn(mockMailService, 'sendMail');

    await essEmailHandler(event);

    expect(sendMailsSpy).not.toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalledWith(
      'No claimer found when trying to send invite accepted email',
      expect.objectContaining({
        claim: expect.any(Object),
        event: expect.objectContaining({
          type: Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED,
        }),
      })
    );
  });
});
