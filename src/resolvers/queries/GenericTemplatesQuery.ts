import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@InputType()
class GenericTemplatesFilter {
  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => [Int], { nullable: true })
  public questionaryIds?: number[];

  @Field(() => [Int], { nullable: true })
  public genericTemplateIds?: number[];

  @Field(() => String, { nullable: true })
  public questionId?: string;

  @Field(() => Int, { nullable: true })
  public proposalPk?: number;
}

@ArgsType()
export class GenericTemplatesArgs {
  @Field(() => GenericTemplatesFilter, { nullable: true })
  public filter?: GenericTemplatesFilter;
}
@Resolver()
export class GenericTemplatesQuery {
  @Query(() => [GenericTemplate], { nullable: true })
  async genericTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: GenericTemplatesArgs
  ) {
    const response = await context.queries.genericTemplate.getGenericTemplates(
      context.user,
      args
    );

    return response;
  }
}
