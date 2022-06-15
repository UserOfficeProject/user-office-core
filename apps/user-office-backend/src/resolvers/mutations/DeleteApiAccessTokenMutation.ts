import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class DeleteApiAccessTokenInput {
  @Field(() => String)
  public accessTokenId: string;
}

@Resolver()
export class DeleteApiAccessTokenMutation {
  @Mutation(() => SuccessResponseWrap)
  deleteApiAccessToken(
    @Arg('deleteApiAccessTokenInput')
    deleteApiAccessTokenInput: DeleteApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.deleteApiAccessToken(
        context.user,
        deleteApiAccessTokenInput
      ),
      SuccessResponseWrap
    );
  }
}
