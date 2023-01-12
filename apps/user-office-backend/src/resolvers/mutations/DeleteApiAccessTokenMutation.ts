import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
// import { SuccessResponseWrap } from '../types/CommonWrappers';

@InputType()
export class DeleteApiAccessTokenInput {
  @Field(() => String)
  public accessTokenId: string;
}

@Resolver()
export class DeleteApiAccessTokenMutation {
  @Mutation(() => Boolean)
  deleteApiAccessToken(
    @Arg('deleteApiAccessTokenInput')
    deleteApiAccessTokenInput: DeleteApiAccessTokenInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.deleteApiAccessToken(
      context.user,
      deleteApiAccessTokenInput
    );
  }
}
