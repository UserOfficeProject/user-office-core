import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateCategoryId } from '../../models/ProposalModel';
import { ProposalTemplate } from '../types/ProposalTemplate';
import { TemplatesArgs } from './TemplatesQuery';

@Resolver()
export class ProposalTemplatesQuery {
  @Query(() => [ProposalTemplate], { nullable: true })
  proposalTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: TemplatesArgs
  ) {
    return context.queries.template.getTemplates(context.user, {
      filter: {
        ...args.filter,
        category: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      },
    });
  }
}
