import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { ProposalDataSourceMock } from '../../datasources/mockups/ProposalDataSource';
import { RoleClaimDataSourceMock } from '../../datasources/mockups/RoleClaimDataSource';
import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Invite } from '../../models/Invite';
import { MailService } from '../MailService/MailService';
import { EmailTemplateId, essEmailHandler } from './essEmailHandler';

describe('essEmailHandler', () => {
  let coProposerDataSourceMock: CoProposerClaimDataSourceMock;
  let roleClaimDataSourceMock: RoleClaimDataSourceMock;
  let proposalDataSourceMock: ProposalDataSourceMock;
  let mailService: MailService;

  beforeEach(() => {
    // Create mock instances
    mailService = container.resolve<MailService>(Tokens.MailService);
    coProposerDataSourceMock = container.resolve<CoProposerClaimDataSourceMock>(
      Tokens.CoProposerClaimDataSource
    );
    roleClaimDataSourceMock = container.resolve<RoleClaimDataSourceMock>(
      Tokens.RoleClaimDataSource
    );
    proposalDataSourceMock = container.resolve<ProposalDataSourceMock>(
      Tokens.ProposalDataSource
    );

    // Reset mocks
    coProposerDataSourceMock.init();
    roleClaimDataSourceMock.init();
    proposalDataSourceMock.init();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Event.INVITE_ACCEPTED', () => {
    it('should send co-proposer invite accepted email when invite is accepted', async () => {
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

      const event: ApplicationEvent = {
        type: Event.INVITE_ACCEPTED,
        invite: mockInvite,
        key: 'invite',
        loggedInUserId: 3,
        isRejection: false,
      };
      const sendMailsSpy = jest.spyOn(mailService, 'sendMail');

      await essEmailHandler(event);

      expect(sendMailsSpy).toHaveBeenCalledTimes(1);
      expect(sendMailsSpy).toHaveBeenCalledWith({
        content: {
          template_id: EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED,
        },
        recipients: [
          {
            address: mockInvite.email,
          },
        ],
        substitution_data: {
          claimerLastname: dummyUser.lastname,
          claimerPreferredname: dummyUser.preferredname,
          email: mockInvite.email,
          piLastname: dummyUser.lastname,
          piPreferredname: dummyUser.preferredname,
          proposalId: 'shortCode',
          proposalTitle: 'title',
        },
      });
    });

    it('should not send email when no co-proposer claims exist for the invite', async () => {
      const mockInvite = new Invite(
        999, // Using an ID that doesn't have co-proposer claims
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

      const event: ApplicationEvent = {
        type: Event.INVITE_ACCEPTED,
        invite: mockInvite,
        key: 'invite',
        loggedInUserId: 3,
        isRejection: false,
      };
      const sendMailsSpy = jest.spyOn(mailService, 'sendMail');

      await essEmailHandler(event);

      expect(sendMailsSpy).not.toHaveBeenCalled();
    });

    it('should not send email when proposal is not found', async () => {
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

      // Temporarily modify the proposal data to simulate proposal not found
      const originalGet = proposalDataSourceMock.get;
      proposalDataSourceMock.get = jest.fn().mockResolvedValue(null);

      const event: ApplicationEvent = {
        type: Event.INVITE_ACCEPTED,
        invite: mockInvite,
        key: 'invite',
        loggedInUserId: 3,
        isRejection: false,
      };
      const sendMailsSpy = jest.spyOn(mailService, 'sendMail');

      await essEmailHandler(event);

      expect(sendMailsSpy).not.toHaveBeenCalled();

      // Restore original method
      proposalDataSourceMock.get = originalGet;
    });
  });
});
