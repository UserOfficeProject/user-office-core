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
class GenericTemplateFilter {
  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => [Int], { nullable: true })
  public questionaryIds?: number[];

  @Field(() => [Int], { nullable: true })
  public GenericTemplateIds?: number[];

  @Field(() => String, { nullable: true })
  public questionId?: string;

  @Field(() => Int, { nullable: true })
  public proposalPk?: number;
}

@ArgsType()
export class GenericTemplateArgs {
  @Field(() => GenericTemplateFilter, { nullable: true })
  public filter?: GenericTemplateFilter;
}
@Resolver()
export class GenericTemplateQuery {
  @Query(() => [GenericTemplate], { nullable: true })
  async GenericTemplate(
    @Ctx() context: ResolverContext,
    @Args() args: GenericTemplateArgs
  ) {
    const response = await context.queries.genericTemplate.getGenericTemplate(
      context.user,
      args
    );

    return response;
  }
}
