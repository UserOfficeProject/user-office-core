import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionsWithAccessToken } from '../types/PermissionsWithAccessToken';

@InputType()
export class UpdateApiAccessTokenInput {
  @Field(() => String)
  public accessTokenId: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public accessPermissions: string;
}

@Resolver()
export class UpdateApiAccessTokenMutation {
  @Mutation(() => PermissionsWithAccessToken)
  updateApiAccessToken(
    @Arg('updateApiAccessTokenInput')
    updateApiAccessTokenInput: UpdateApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.updateApiAccessToken(
      context.user,
      updateApiAccessTokenInput
    );
  }
}
