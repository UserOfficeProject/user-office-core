import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

@Resolver()
export class DeleteTemplateMutation {
  @Mutation(() => Template)
  deleteTemplate(
    @Arg('templateId', () => Int) templateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.deleteTemplate(context.user, {
      templateId,
    });
  }
}
