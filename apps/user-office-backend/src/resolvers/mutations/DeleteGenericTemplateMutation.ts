import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@Resolver()
export class DeleteGenericTemplateMutation {
  @Mutation(() => GenericTemplate)
  deleteGenericTemplate(
    @Arg('genericTemplateId', () => Int) genericTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.genericTemplate.deleteGenericTemplate(
      context.user,
      genericTemplateId
    );
  }
}
