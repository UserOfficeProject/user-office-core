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
    const members: number[] = [];

    const usersWithRoles = await stfcUserDataSource.getUsersRoles(
      args.memberIds
    );

    usersWithRoles.forEach((user) => {
      !!user.roles.find(
        (role) =>
          role.shortCode === 'fap_reviewer' || role.shortCode === 'user_officer'
      ) && members.push(user.userId);
    });

    if (members.length === args.memberIds.length) {
      return super.assignReviewersToFap(args);
    }

    throw new GraphQLError('Some members did not have the correct Roles');
  }
}
