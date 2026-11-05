import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@InputType()
export class DeleteOAuthClientInput {
  @Field(() => String)
  public clientId: string;
}

@Resolver()
export class DeleteOAuthClientMutation {
  @Mutation(() => Boolean)
  deleteOAuthClient(
    @Arg('deleteOAuthClientInput')
    deleteOAuthClientInput: DeleteOAuthClientInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.deleteOAuthClient(
      context.user,
      deleteOAuthClientInput
    );
  }
}
