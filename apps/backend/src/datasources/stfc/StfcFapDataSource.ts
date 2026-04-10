import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { StfcUserDataSource } from './StfcUserDataSource';
import { Tokens } from '../../config/Tokens';
import { Fap } from '../../models/Fap';
import { UserRole, UserRoleShortCodeMap } from '../../models/User';
import {
  AssignChairOrSecretaryToFapInput,
  AssignReviewersToFapArgs,
  UpdateMemberFapArgs,
} from '../../resolvers/mutations/AssignMembersToFapMutation';
import { FapDataSource } from '../FapDataSource';
import CallDataSource from '../postgres/CallDataSource';
import PostgresFapDataSource from '../postgres/FapDataSource';

enum STFCRolesMap {
  FAP_CHAIR = 50,
  FAP_SECRETARY = 51,
  FAP_REVIEWER = 52,
}

export default class StfcFapDataSource
  extends PostgresFapDataSource
  implements FapDataSource
{
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  constructor() {
    super(new CallDataSource());
  }

  async assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap> {
    const roles = await this.stfcUserDataSource.getUserRoles(args.userId);

    if (
      !roles.find((role) => {
        return (
          role.shortCode === UserRoleShortCodeMap[args.roleId] ||
          role.shortCode === 'user_officer'
        );
      })
    ) {
      return await this.stfcUserDataSource
        .assignSTFCRoleToUser(
          args.userId,
          args.roleId === UserRole.FAP_CHAIR
            ? STFCRolesMap.FAP_CHAIR
            : STFCRolesMap.FAP_SECRETARY
        )
        .then(() => {
          return super.assignChairOrSecretaryToFap(args);
        })
        .catch((error) => {
          logger.logError(
            'An error occurred while assigning a FAP Sec/Chair role',
            error
          );

          throw new GraphQLError(
            `User does not have the correct role ${args.userId}`
          );
        });
    } else {
      return super.assignChairOrSecretaryToFap(args);
    }
  }

  async assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap> {
    const usersWithRoles = await this.stfcUserDataSource.getUsersRoles(
      args.memberIds
    );

    const ineligibleUserIds = usersWithRoles
      .filter((user) =>
        user.roles.every(
          (role) => !['fap_reviewer', 'user_officer'].includes(role.shortCode)
        )
      )
      .map((user) => user.userId);

    const failedAssignmentUserIds: number[] = [];

    if (ineligibleUserIds.length > 0) {
      await Promise.all(
        ineligibleUserIds.map(async (userId) => {
          return this.stfcUserDataSource
            .assignSTFCRoleToUser(userId, STFCRolesMap.FAP_REVIEWER)
            .catch((error) => {
              logger.logError(
                'An error occurred while assigning a FAP Member role',
                error
              );

              failedAssignmentUserIds.push(userId);

              return null;
            });
        })
      );
    }

    if (failedAssignmentUserIds.length === 0) {
      return super.assignReviewersToFap(args);
    }

    const failedAssignmentUsers = await Promise.resolve(
      this.stfcUserDataSource.getUsersByUserNumbers(failedAssignmentUserIds)
    );

    const failedAssignmentUserEmails = failedAssignmentUsers.map(
      (user) => user.email
    );

    throw new GraphQLError(
      `Some members: ${failedAssignmentUserEmails} were unable to be assigned the correct role`
    );
  }

  stfcRoleMap = new Map<UserRole, STFCRolesMap>([
    [UserRole.FAP_CHAIR, STFCRolesMap.FAP_CHAIR],
    [UserRole.FAP_SECRETARY, STFCRolesMap.FAP_SECRETARY],
    [UserRole.FAP_REVIEWER, STFCRolesMap.FAP_REVIEWER],
  ]);

  async removeMemberFromFap(args: UpdateMemberFapArgs): Promise<Fap> {
    const role = UserRoleShortCodeMap[args.roleId];
    const faps = await this.getUserFaps(args.memberId, role);

    const roles = await this.stfcUserDataSource.getUserRoles(args.memberId);

    const isUserOfficer = roles.some(
      (role) => role.shortCode === 'user_officer'
    );

    // If the user has no FAP left assigned to them we revoke their role
    if (faps.length === 1 && !isUserOfficer) {
      await this.stfcUserDataSource
        .removeFapRoleFromUser(
          args.memberId,
          this.stfcRoleMap.get(args.roleId)!
        )
        .catch((error) => {
          logger.logError(
            'An error occurred while removing a FAP Member role',
            error
          );
          throw new GraphQLError(
            `User does not have the correct role ${args.memberId}`
          );
        });
    }

    return super.removeMemberFromFap(args);
  }
}
