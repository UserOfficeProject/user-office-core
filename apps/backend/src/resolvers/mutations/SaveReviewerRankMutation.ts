import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  ArgsType,
  Args,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class SaveReviewerRankArg {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public reviewerId: number;

  @Field(() => Int)
  public rank: number;
}

@Resolver()
export class TokenMutation {
  @Mutation(() => Boolean)
  saveReviewerRank(
    @Args() args: SaveReviewerRankArg,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.saveReviewerRank(context.user, args);
  }
}
