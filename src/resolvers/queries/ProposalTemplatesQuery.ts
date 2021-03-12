import {
  Args,
  Ctx,
  Query,
  Resolver,
  InputType,
  Field,
  ArgsType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateCategoryId } from '../../models/Template';
import { ProposalTemplate } from '../types/ProposalTemplate';
@InputType()
class ProposalTemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;
}

@ArgsType()
export class ProposalTemplatesArgs {
  @Field(() => ProposalTemplatesFilter, { nullable: true })
  public filter?: ProposalTemplatesFilter;
}

@Resolver()
export class ProposalTemplatesQuery {
  @Query(() => [ProposalTemplate], { nullable: true })
  proposalTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: ProposalTemplatesArgs
  ) {
    return context.queries.template.getTemplates(context.user, {
      filter: {
        ...args.filter,
        category: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      },
    });
  }
}
