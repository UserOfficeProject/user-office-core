import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ApiAccessTokenResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class CreateApiAccessTokenInput {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public accessPermissions: string;
}

@Resolver()
export class CreateApiAccessTokenMutation {
  @Mutation(() => ApiAccessTokenResponseWrap)
  createApiAccessToken(
    @Arg('createApiAccessTokenInput')
    createApiAccessTokenInput: CreateApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.createApiAccessToken(
        context.user,
        createApiAccessTokenInput
      ),
      ApiAccessTokenResponseWrap
    );
  }
}
