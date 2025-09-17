import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplate } from '../types/EmailTemplate';

@Resolver()
export class EmailTemplateQuery {
  @Query(() => EmailTemplate, { nullable: true })
  emailTemplate(
    @Arg('emailTemplateId', () => Int) emailTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.emailTemplate.get(context.user, emailTemplateId);
  }
}
