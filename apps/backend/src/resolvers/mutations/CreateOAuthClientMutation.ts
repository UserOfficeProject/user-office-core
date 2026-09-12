import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { OAuthClient } from '../types/OAuthClient';

@InputType()
export class CreateOAuthClientInput {
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
export class CreateOAuthClientMutation {
  @Mutation(() => OAuthClient)
  createOAuthClient(
    @Arg('createOAuthClientInput')
    createOAuthClientInput: CreateOAuthClientInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.createOAuthClient(
      context.user,
      createOAuthClientInput
    );
  }
}
