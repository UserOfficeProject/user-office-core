import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@Resolver()
export class CloneGenericTemplateMutation {
  @Mutation(() => GenericTemplate)
  cloneGenericTemplate(
    @Arg('genericTemplateId', () => Int) genericTemplateId: number,
    @Arg('title', () => String, { nullable: true }) title: string | undefined,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.genericTemplate.cloneGenericTemplate(
      context.user,
      genericTemplateId,
      title
    );
  }
}
