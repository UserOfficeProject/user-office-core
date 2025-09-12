import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { RoleClaimDataSourceMock } from '../../datasources/mockups/RoleClaimDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { eliEmailHandler } from './eliEmailHandler';
import { EmailTemplateId } from './emailTemplateId';

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
            db_template_id: 1,
            template_id: EmailTemplateId.PROPOSAL_CREATED,
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
            db_template_id: 1,
            template_id: EmailTemplateId.ACCEPTED_PROPOSAL,
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
            db_template_id: 1,
            template_id: EmailTemplateId.REJECTED_PROPOSAL,
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
            db_template_id: 1,
            template_id: EmailTemplateId.RESERVED_PROPOSAL,
          },
        })
      );
    });

    test('should use template reviewer-reminder', async () => {
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
            db_template_id: 1,
            template_id: EmailTemplateId.REVIEW_REMINDER,
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
            db_template_id: 1,
            template_id: EmailTemplateId.INTERNAL_REVIEW_CREATED,
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
            db_template_id: 1,
            template_id: EmailTemplateId.INTERNAL_REVIEW_UPDATED,
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
            db_template_id: 1,
            template_id: EmailTemplateId.INTERNAL_REVIEW_DELETED,
          },
        })
      );
    });
  });
});
