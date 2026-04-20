import { logger } from '@user-office-software/duo-logger';
import { Arg, Int, Mutation, Resolver, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role';

@Resolver()
export class UpdateRoleTagsMutation {
  @Mutation(() => Role)
  async updateRoleTags(
    @Arg('roleId', () => Int) roleId: number,
    @Arg('tagIds', () => [Int]) tagIds: number[],
    @Ctx() context: ResolverContext
  ): Promise<Role> {
    try {
      const role = await context.mutations.roleTags.updateRoleTags(
        context.user,
        roleId,
        tagIds
      );

      return new Role(role);
    } catch (error) {
      logger.logError('Error updating tags for role', {
        roleId,
        tagIds,
        error,
      });

      throw error;
    }
  }
}
