import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CloneGenericTemplateMutation {
  @Mutation(() => GenericTemplateResponseWrap)
  cloneGenericTemplate(
    @Arg('genericTemplateId', () => Int) genericTemplateId: number,
    @Arg('title', () => String, { nullable: true }) title: string | undefined,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.genericTemplate.cloneGenericTemplate(
        context.user,
        genericTemplateId,
        title
      ),
      GenericTemplateResponseWrap
    );
  }
}
