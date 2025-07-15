import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplate } from '../types/EmailTemplate';

@InputType()
export class EmailTemplatesFilter {
  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => [Int], { nullable: true })
  public emailTemplateIds?: number[];
}

@ObjectType()
class EmailTemplatesQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [EmailTemplate])
  public emailTemplates: EmailTemplate[];
}

@Resolver()
export class EmailTemplatesQuery {
  @Query(() => EmailTemplatesQueryResult, { nullable: true })
  emailTemplates(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => EmailTemplatesFilter, { nullable: true })
    filter: EmailTemplatesFilter
  ) {
    return context.queries.emailTemplate.getAll(context.user, filter);
  }
}
