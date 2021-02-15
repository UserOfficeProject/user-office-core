import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ApiAccessTokenResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => ApiAccessTokenResponseWrap)
  updateApiAccessToken(
    @Arg('updateApiAccessTokenInput')
    updateApiAccessTokenInput: UpdateApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.updateApiAccessToken(
        context.user,
        updateApiAccessTokenInput
      ),
      ApiAccessTokenResponseWrap
    );
  }
}
