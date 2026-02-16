import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';
@ArgsType()
export class UpsertUserByOidcSubArgs {
  @Field(() => String, { nullable: true })
  public userTitle: string | null;

  @Field(() => String)
  public firstName: string;

  @Field(() => String)
  public lastName: string;

  @Field(() => String, { nullable: true })
  public preferredName: string | null;

  @Field(() => String)
  public oidcSub: string;

  @Field(() => String)
  public institutionRoRId: string;

  @Field(() => String)
  public institutionName: string;

  @Field(() => String)
  public institutionCountry: string;

  @Field(() => String)
  public email: string;
}

@Resolver()
export class UpsertUserByOidcSubMutation {
  @Mutation(() => User)
  upsertUserByOidcSub(
    @Args() input: UpsertUserByOidcSubArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.upsertUserByOidcSub(context.user, input);
  }
}
