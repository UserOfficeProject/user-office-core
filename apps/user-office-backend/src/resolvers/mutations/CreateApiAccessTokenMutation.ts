import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionsWithAccessToken } from '../types/PermissionsWithAccessToken';

@InputType()
export class CreateApiAccessTokenInput {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public accessPermissions: string;
}

@Resolver()
export class CreateApiAccessTokenMutation {
  @Mutation(() => PermissionsWithAccessToken)
  createApiAccessToken(
    @Arg('createApiAccessTokenInput')
    createApiAccessTokenInput: CreateApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.createApiAccessToken(
      context.user,
      createApiAccessTokenInput
    );
  }
}
