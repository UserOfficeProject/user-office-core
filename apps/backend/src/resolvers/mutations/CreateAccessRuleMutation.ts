import { Arg, Ctx, Field, InputType, Mutation } from 'type-graphql';

import { ResolverContext } from '../../context';
import { AccessRule } from '../types/AccessRule';

@InputType()
export class CreateAccessRuleInput {
  @Field()
  public role: string;

  @Field()
  public role_id: number;

  @Field()
  public subject: string;

  @Field()
  public action: string;

  @Field(() => String, { nullable: true })
  public conditions?: string;
}

export class AcceptInvite {
  @Mutation(() => AccessRule)
  createAccessRuleMutation(@Arg('createAccessRuleInput') createAccessRuleInput: CreateAccessRuleInput, @Ctx() context: ResolverContext) {
    return context.mutations.access.create(context.user, createAccessRuleInput);
  }
}