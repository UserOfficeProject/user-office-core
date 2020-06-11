import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Query,
  Resolver,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Template } from '../types/Template';
import { TemplateCategoryId } from '../../models/ProposalModel';
@InputType()
class TemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;

  @Field(() => TemplateCategoryId, { nullable: true })
  public category?: TemplateCategoryId;
}

@ArgsType()
export class TemplatesArgs {
  @Field(() => TemplatesFilter, { nullable: true })
  public filter?: TemplatesFilter;
}
@Resolver()
export class TemplatesQuery {
  @Query(() => [Template], { nullable: true })
  templates(@Ctx() context: ResolverContext, @Args() args: TemplatesArgs) {
    return context.queries.template.getTemplates(context.user, args);
  }
}
