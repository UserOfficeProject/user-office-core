import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class AddCasbinPolicyMutation {
  @Mutation(() => Boolean)
  addCasbinPolicy(
    @Arg('subject', () => String) subject: string,
    @Arg('object', () => String) object: string,
    @Arg('action', () => String) action: string,
    @Arg('condition', () => String) condition: string,
    @Arg('allowOrDeny', () => String) allowOrDeny: string,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.auth.casbinService.addPolicyWithCondition(
      subject,
      object,
      action,
      condition,
      allowOrDeny
    );
  }
}
