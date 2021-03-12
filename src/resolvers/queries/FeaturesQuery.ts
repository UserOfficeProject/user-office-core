import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Feature } from '../types/Feature';

@Resolver()
export class FeaturesQuery {
  @Query(() => [Feature])
  features(@Ctx() context: ResolverContext) {
    return context.queries.admin.getFeatures();
  }
}
