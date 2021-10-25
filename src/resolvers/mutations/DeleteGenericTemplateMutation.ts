import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteGenericTemplateMutation {
  @Mutation(() => GenericTemplateResponseWrap)
  deleteGenericTemplate(
    @Arg('genericTemplateId', () => Int) genericTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.genericTemplate.deleteGenericTemplate(
        context.user,
        genericTemplateId
      ),
      GenericTemplateResponseWrap
    );
  }
}
