import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { OAuthClient } from '../types/OAuthClient';

@InputType()
export class UpdateOAuthClientInput {
  @Field(() => String)
  public clientId: string;

  @Field(() => String)
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string | null;

  @Field(() => String)
  public accessPermissions: string;
}

@Resolver()
export class UpdateOAuthClientMutation {
  @Mutation(() => OAuthClient)
  updateOAuthClient(
    @Arg('updateOAuthClientInput')
    updateOAuthClientInput: UpdateOAuthClientInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.updateOAuthClient(
      context.user,
      updateOAuthClientInput
    );
  }
}
