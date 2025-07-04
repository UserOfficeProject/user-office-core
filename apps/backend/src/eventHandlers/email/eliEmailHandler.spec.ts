import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { RoleClaimDataSourceMock } from '../../datasources/mockups/RoleClaimDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { UserRole } from '../../models/User';
import { eliEmailHandler } from './eliEmailHandler';
import { getTemplateIdForInvite } from './essEmailHandler';

// Mock MailService
const mockMailService = {
  sendMail: jest.fn(),
};

describe('eliEmailHandler', () => {
  let coProposerDataSourceMock: CoProposerClaimDataSourceMock;
  let roleClaimDataSourceMock: RoleClaimDataSourceMock;

  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });

  beforeEach(() => {
    // Initialize mocks
    coProposerDataSourceMock = container.resolve<CoProposerClaimDataSourceMock>(
      Tokens.CoProposerClaimDataSource
    );
    roleClaimDataSourceMock = container.resolve<RoleClaimDataSourceMock>(
      Tokens.RoleClaimDataSource
    );

    coProposerDataSourceMock.init();
    roleClaimDataSourceMock.init();

    // Reset mock
    mockMailService.sendMail.mockClear();
    mockMailService.sendMail.mockResolvedValue({ success: true });
  });

  describe('getTemplateIdForInvite', () => {
    test('should return co-proposer template when co-proposer claim exists', async () => {
      const inviteId = faker.number.int();
      const mockCoProposerClaim = {
        inviteId,
        proposalPk: faker.number.int(),
      };

      // Mock co-proposer claim exists
      jest
        .spyOn(coProposerDataSourceMock, 'findByInviteId')
        .mockResolvedValue([mockCoProposerClaim]);

      // Mock no role claims
      jest
        .spyOn(roleClaimDataSourceMock, 'findByInviteId')
        .mockResolvedValue([]);

      const result = await getTemplateIdForInvite(inviteId);

      expect(result).toBe('user-office-registration-invitation-co-proposer');
    });

    test('should return reviewer template when internal reviewer role claim exists', async () => {
      const inviteId = faker.number.int();
      const mockRoleClaim = {
        roleClaimId: faker.number.int(),
        inviteId,
        roleId: UserRole.INTERNAL_REVIEWER,
      };

      // Mock no co-proposer claims
      jest
        .spyOn(coProposerDataSourceMock, 'findByInviteId')
        .mockResolvedValue([]);

      // Mock internal reviewer role claim
      jest
        .spyOn(roleClaimDataSourceMock, 'findByInviteId')
        .mockResolvedValue([mockRoleClaim]);

      const result = await getTemplateIdForInvite(inviteId);

      expect(result).toBe('user-office-registration-invitation-reviewer');
    });

    test('should return user template when user role claim exists', async () => {
      const inviteId = faker.number.int();
      const mockRoleClaim = {
        roleClaimId: faker.number.int(),
        inviteId,
        roleId: UserRole.USER,
      };

      // Mock no co-proposer claims
      jest
        .spyOn(coProposerDataSourceMock, 'findByInviteId')
        .mockResolvedValue([]);

      // Mock user role claim
      jest
        .spyOn(roleClaimDataSourceMock, 'findByInviteId')
        .mockResolvedValue([mockRoleClaim]);

      const result = await getTemplateIdForInvite(inviteId);

      expect(result).toBe('user-office-registration-invitation-user');
    });

    test('should use template proposal-created', async () => {
      // Create a mock event for PROPOSAL_CREATED
      const mockEvent: ApplicationEvent = {
        type: Event.PROPOSAL_CREATED,
        proposal: {
          primaryKey: 1,
          title: faker.lorem.sentence(),
          proposerId: 1,
          proposalId: faker.string.alphanumeric(),
          callId: 1,
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'proposal-created',
          },
        })
      );
    });

    test('should use template Accepted-Proposal', async () => {
      // Create a mock event for PROPOSAL_NOTIFIED with ACCEPTED status
      const mockEvent: ApplicationEvent = {
        type: Event.PROPOSAL_NOTIFIED,
        proposal: {
          primaryKey: faker.number.int(),
          title: faker.lorem.sentence(),
          proposerId: faker.number.int(),
          proposalId: faker.string.alphanumeric(),
          callId: faker.number.int(),
          finalStatus: 1, // ProposalEndStatus.ACCEPTED
          commentForUser: faker.lorem.sentence(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'Accepted-Proposal',
          },
        })
      );
    });

    test('should use template Rejected-Proposal', async () => {
      // Create a mock event for PROPOSAL_NOTIFIED with REJECTED status
      const mockEvent: ApplicationEvent = {
        type: Event.PROPOSAL_NOTIFIED,
        proposal: {
          primaryKey: faker.number.int(),
          title: faker.lorem.sentence(),
          proposerId: faker.number.int(),
          proposalId: faker.string.alphanumeric(),
          callId: faker.number.int(),
          finalStatus: 3, // ProposalEndStatus.REJECTED
          commentForUser: faker.lorem.sentence(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'Rejected-Proposal',
          },
        })
      );
    });

    test('should use template Reserved-Proposal', async () => {
      // Create a mock event for PROPOSAL_NOTIFIED with RESERVED status
      const mockEvent: ApplicationEvent = {
        type: Event.PROPOSAL_NOTIFIED,
        proposal: {
          primaryKey: faker.number.int(),
          title: faker.lorem.sentence(),
          proposerId: faker.number.int(),
          proposalId: faker.string.alphanumeric(),
          callId: faker.number.int(),
          finalStatus: 2, // ProposalEndStatus.RESERVED
          commentForUser: faker.lorem.sentence(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'Reserved-Proposal',
          },
        })
      );
    });

    test('should use template review-reminder', async () => {
      // Create a mock event for FAP_REVIEWER_NOTIFIED
      const mockEvent: ApplicationEvent = {
        type: Event.FAP_REVIEWER_NOTIFIED,
        fapReview: {
          id: 1,
          userID: 1,
          proposalPk: 1,
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'review-reminder',
          },
        })
      );
    });

    test('should use template internal-review-created', async () => {
      // Create a mock event for INTERNAL_REVIEW_CREATED
      const mockEvent: ApplicationEvent = {
        type: Event.INTERNAL_REVIEW_CREATED,
        key: 'internal-review-created',
        loggedInUserId: faker.number.int({ min: 1, max: 100 }),
        internalreview: {
          id: faker.number.int({ min: 1, max: 1000 }),
          title: `Internal Review: ${faker.company.buzzPhrase()}`,
          reviewerId: faker.number.int({ min: 1, max: 100 }),
          assignedBy: faker.number.int({ min: 1, max: 100 }),
          proposalPk: faker.number.int({ min: 1, max: 1000 }),
          technicalReviewId: faker.number.int({ min: 1, max: 1000 }),
          comment: faker.lorem.paragraph(),
          files: faker.system.fileName(),
          createdAt: faker.date.recent(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'internal-review-created',
          },
        })
      );
    });

    test('should use template internal-review-updated', async () => {
      // Create a mock event for INTERNAL_REVIEW_UPDATED
      const mockEvent: ApplicationEvent = {
        type: Event.INTERNAL_REVIEW_UPDATED,
        key: 'internal-review-updated',
        loggedInUserId: faker.number.int({ min: 1, max: 100 }),
        internalreview: {
          id: faker.number.int({ min: 1, max: 1000 }),
          title: `Updated Review: ${faker.company.buzzPhrase()}`,
          reviewerId: faker.number.int({ min: 1, max: 100 }),
          assignedBy: faker.number.int({ min: 1, max: 100 }),
          proposalPk: faker.number.int({ min: 1, max: 1000 }),
          technicalReviewId: faker.number.int({ min: 1, max: 1000 }),
          comment: faker.lorem.paragraph(),
          files: faker.system.fileName(),
          createdAt: faker.date.recent(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'internal-review-updated',
          },
        })
      );
    });

    test('should use template internal-review-deleted', async () => {
      // Create a mock event for INTERNAL_REVIEW_DELETED
      const mockEvent: ApplicationEvent = {
        type: Event.INTERNAL_REVIEW_DELETED,
        key: 'internal-review-deleted',
        loggedInUserId: faker.number.int({ min: 1, max: 100 }),
        internalreview: {
          id: faker.number.int({ min: 1, max: 1000 }),
          title: `Deleted Review: ${faker.company.buzzPhrase()}`,
          reviewerId: faker.number.int({ min: 1, max: 100 }),
          assignedBy: faker.number.int({ min: 1, max: 100 }),
          proposalPk: faker.number.int({ min: 1, max: 1000 }),
          technicalReviewId: faker.number.int({ min: 1, max: 1000 }),
          comment: faker.lorem.paragraph(),
          files: faker.system.fileName(),
          createdAt: faker.date.recent(),
        },
        isRejection: false,
      } as ApplicationEvent;

      // Call the eliEmailHandler with the mock event
      await eliEmailHandler(mockEvent);

      // Verify that sendMail was called with the correct template_id
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template_id: 'internal-review-deleted',
          },
        })
      );
    });
  });
});
