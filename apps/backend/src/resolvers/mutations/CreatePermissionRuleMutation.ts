import { Args, ArgsType, Ctx, Field, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionRule } from '../types/PermissionRule';

@ArgsType()
export class CreatePermissionRuleArgs {
  @Field(() => String)
  public role: string;

  @Field(() => String)
  public subject: string;

  @Field(() => String)
  public action: string;

  @Field(() => String, { nullable: true })
  public conditions?: string;

  @Field(() => Boolean)
  public isDbPermission: boolean;
}

@Resolver()
export class CreatePermissionRuleMutation {
  @Mutation(() => PermissionRule)
  createPermissionRule(
    @Args() args: CreatePermissionRuleArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.permission.create(context.user, args);
  }
}