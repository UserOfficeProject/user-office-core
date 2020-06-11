import { Args, Ctx, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';
import { TemplatesArgs } from './TemplatesQuery';
import { TemplateCategoryId } from '../../models/ProposalModel';

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
