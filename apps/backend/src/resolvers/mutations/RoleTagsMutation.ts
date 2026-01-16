import { logger } from '@user-office-software/duo-logger';
import {
  Arg,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
class RoleTagOperationResult {
  @Field(() => Boolean)
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@Resolver()
export class RoleTagsMutation {
  @Mutation(() => RoleTagOperationResult)
  async addTagToRole(
    @Arg('roleId', () => Int) roleId: number,
    @Arg('tagId', () => Int) tagId: number,
    @Ctx() context: ResolverContext
  ): Promise<RoleTagOperationResult> {
    try {
      await context.mutations.roleTags.addTagToRole(
        context.user,
        roleId,
        tagId
      );

      return {
        success: true,
        message: `Tag ${tagId} added to role ${roleId}`,
      };
    } catch (error) {
      logger.logError('Error adding tag to role', {
        roleId,
        tagId,
        error,
      });

      throw error;
    }
  }

  @Mutation(() => RoleTagOperationResult)
  async removeTagFromRole(
    @Arg('roleId', () => Int) roleId: number,
    @Arg('tagId', () => Int) tagId: number,
    @Ctx() context: ResolverContext
  ): Promise<RoleTagOperationResult> {
    try {
      await context.mutations.roleTags.removeTagFromRole(
        context.user,
        roleId,
        tagId
      );

      return {
        success: true,
        message: `Tag ${tagId} removed from role ${roleId}`,
      };
    } catch (error) {
      logger.logError('Error removing tag from role', {
        roleId,
        tagId,
        error,
      });

      throw error;
    }
  }
}
