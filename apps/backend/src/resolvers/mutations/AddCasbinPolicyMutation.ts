import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class AddCasbinPolicyInput {
  @Field(() => String)
  subject: string;

  @Field(() => String)
  resource: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  condition: string;

  @Field(() => String)
  effect: string;
}

@Resolver()
export class AddCasbinPolicyMutation {
  @Mutation(() => Boolean)
  async addCasbinPolicy(
    @Args() input: AddCasbinPolicyInput,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return await context.mutations.permission.addCasbinPolicy(
      context.user,
      input
    );
  }
}
