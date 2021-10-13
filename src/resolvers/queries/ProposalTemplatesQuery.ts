import {
  Args,
  Ctx,
  Query,
  Resolver,
  InputType,
  Field,
  ArgsType,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';
import { TemplateGroupId } from './../../models/Template';
@InputType()
class ProposalTemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];
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
        group: TemplateGroupId.PROPOSAL,
      },
    });
  }
}
