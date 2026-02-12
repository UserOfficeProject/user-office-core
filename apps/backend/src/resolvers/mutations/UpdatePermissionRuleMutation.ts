import { Args, ArgsType, Ctx, Field, Int, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionRule } from '../types/PermissionRule';

@ArgsType()
export class UpdatePermissionRuleArgs {
  @Field(() => String)
  public role: string;

  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public subject: string;

  @Field(() => String)
  public action: string;

  @Field(() => String, { nullable: true })
  public conditions?: string;
}

export class UpdatePermissionRuleMutation {
  @Mutation(() => PermissionRule)
  updatePermissionRule(
    @Args() args: UpdatePermissionRuleArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.permission.update(context.user, args);
  }
}