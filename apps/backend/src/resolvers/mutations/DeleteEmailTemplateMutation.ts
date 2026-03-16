import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplate } from '../types/EmailTemplate';

@Resolver()
export class DeleteEmailTemplateMutation {
  @Mutation(() => EmailTemplate)
  deleteEmailTemplate(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.emailTemplate.delete(context.user, {
      emailTemplateId: id,
    });
  }
}
