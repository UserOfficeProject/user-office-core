import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Review } from '../types/Review';

@Resolver()
export class ReviewQuery {
  @Query(() => Review, { nullable: true })
  review(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return context.queries.review.get(context.user, id);
  }
}
