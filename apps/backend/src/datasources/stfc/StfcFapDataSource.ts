import { GraphQLError } from 'graphql';

import { Fap } from '../../models/Fap';
import { UserRoleShortCodeMap } from '../../models/User';
import {
  AssignChairOrSecretaryToFapInput,
  AssignReviewersToFapArgs,
} from '../../resolvers/mutations/AssignMembersToFapMutation';
import { FapDataSource } from '../FapDataSource';
import PostgresFapDataSource from '../postgres/FapDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

const stfcUserDataSource = new StfcUserDataSource();

export default class StfcFapDataSource
  extends PostgresFapDataSource
  implements FapDataSource
{
  async assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap> {
    const roles = await stfcUserDataSource.getUserRoles(args.userId);

    if (
      roles.find((role) => {
        return (
          role.shortCode === UserRoleShortCodeMap[args.roleId] ||
          role.shortCode === 'user_officer'
        );
      })
    ) {
      return super.assignChairOrSecretaryToFap(args);
    }

    throw new GraphQLError(
      `User does not have the correct role ${args.userId}`
    );
  }

  async assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap> {
    const usersWithRoles = await stfcUserDataSource.getUsersRoles(
      args.memberIds
    );

    const members = usersWithRoles
      .filter((user) =>
        user.roles.every(
          (role) => !['fap_reviewer', 'user_officer'].includes(role.shortCode)
        )
      )
      .map((user) => user.userId);

    if (members.length === 0) {
      return super.assignReviewersToFap(args);
    }

    const usersWithoutRole = await Promise.resolve(
      stfcUserDataSource.getUsersByUserNumbers(members)
    );

    const userEmails = usersWithoutRole.map((user) => user.email);

    throw new GraphQLError(
      `Some members: ${userEmails} did not have the correct Roles`
    );
  }
}
