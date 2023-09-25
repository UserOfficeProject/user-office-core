import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

@Resolver()
export class CloneTemplateMutation {
  @Mutation(() => Template)
  cloneTemplate(
    @Arg('templateId', () => Int) templateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.cloneTemplate(context.user, {
      templateId,
    });
  }
}
