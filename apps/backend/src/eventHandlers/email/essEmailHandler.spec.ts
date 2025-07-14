import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../../datasources/mockups/CoProposerClaimDataSource';
import { RoleClaimDataSourceMock } from '../../datasources/mockups/RoleClaimDataSource';
import { UserRole } from '../../models/User';
import { getTemplateIdForInvite } from './essEmailHandler';

describe('essEmailHandler', () => {
  let coProposerDataSourceMock: CoProposerClaimDataSourceMock;
  let roleClaimDataSourceMock: RoleClaimDataSourceMock;

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
  });

  describe('getTemplateIdForInvite', () => {
    test('should return co-proposer template when co-proposer claim exists', async () => {
      const inviteId = 1;
      const mockCoProposerClaim = {
        inviteId,
        proposalPk: 1,
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
      const inviteId = 2;
      const mockRoleClaim = {
        roleClaimId: 1,
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
      const inviteId = 3;
      const mockRoleClaim = {
        roleClaimId: 2,
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
  });
});
